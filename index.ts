import * as awsx from "@pulumi/awsx";
import * as awsxClassic from "@pulumi/awsx/classic";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ECRClient, UntagResourceCommand } from "@aws-sdk/client-ecr";

const config = new pulumi.Config();

async function main() {
  const target = process.env.GITHUB_REF_NAME;

  const secretMeta = await aws.secretsmanager.getSecret({
    name: "marketing-web",
  });

  const secretObj = await aws.secretsmanager.getSecretVersion({
    secretId: secretMeta.id,
  });

  const ecrRepo = new awsx.ecr.Repository("marketing-website", {
    imageTagMutability: "MUTABLE",
    imageScanningConfiguration: {
      scanOnPush: true,
    },
    tags: {
      Name: "marketing-web",
    },
  });

  pulumi.all([ecrRepo.repository.arn]).apply(async ([arn]) => {
    const ecrClient = new ECRClient({
      region: process.env.AWS_REGION,
    });

    const untagCommand = new UntagResourceCommand({
      resourceArn: arn,
      tagKeys: ["latest"],
    });

    // @ts-ignore -- It sure as hell does exist.
    const untagged = await ecrClient.send(untagCommand);

    const image = new awsx.ecr.Image("marketing-website", {
      repositoryUrl: ecrRepo.url,
      path: "./",
    });

    const secret = JSON.parse(secretObj.secretString);

    const waf = new aws.wafv2.WebAcl("marketing-website-waf", {
      defaultAction: {
        allow: {},
      },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudwatchMetricsEnabled: true,
        metricName: "marketing-website-waf",
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: "AWSManagedRulesCommonRuleSet",
          priority: 0,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesCommonRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: "AWSManagedRulesCommonRuleSet",
            sampledRequestsEnabled: true,
          },
          overrideAction: {
            count: {},
          },
        },
        {
          name: "AWSManagedRulesKnownBadInputsRuleSet",
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesKnownBadInputsRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: "AWSManagedRulesKnownBadInputsRuleSet",
            sampledRequestsEnabled: true,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          name: "AWSManagedRulesAmazonIpReputationList",
          priority: 2,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesAmazonIpReputationList",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: "AWSManagedRulesAmazonIpReputationList",
            sampledRequestsEnabled: true,
          },
          overrideAction: {
            none: {},
          },
        },
        {
          name: "AWSManagedRulesAnonymousIpList",
          priority: 3,
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesAnonymousIpList",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudwatchMetricsEnabled: true,
            metricName: "AWSManagedRulesAnonymousIpList",
            sampledRequestsEnabled: true,
          },
          overrideAction: {
            none: {},
          },
        },
      ],
    });

    const alb = new awsxClassic.lb.ApplicationLoadBalancer("net-lb", {
      enableHttp2: true,
      accessLogs: {
        bucket: `marketing-website-logs-${target}`,
        prefix: `marketing-website-${target}`,
      },
      name: `marketing-website-${process.env.GITHUB_REF_NAME}`,
    });

    const wafassoc = new aws.wafv2.WebAclAssociation(
      "marketing-website-wafassoc",
      {
        resourceArn: alb.loadBalancer.arn,
        webAclArn: waf.arn,
      }
    );

    const environment = Object.keys(secret).map((key) => ({
      name: key,
      value: `${secret[key]}`,
    }));

    const targetgroup1 = alb.createTargetGroup("website-tg", {
      protocol: "HTTP",
      stickiness: {
        type: "lb_cookie",
      },
      port: 80,
      healthCheck: {
        path: "/",
        interval: 60,
        timeout: 30,
        healthyThreshold: 2,
        unhealthyThreshold: 8,
        matcher: "200-499",
      },
      slowStart: 120,
    });

    const web = alb.createListener("website-http", {
      protocol: "HTTP",
      targetGroup: targetgroup1,
    });

    const defaultCertificateArn =
      "arn:aws:acm:us-west-2:032719859041:certificate/8cae1a5e-8ca5-4077-ac0e-102357de5f73";

    const webHttps = alb.createListener("website-https", {
      protocol: "HTTPS",
      certificateArn: defaultCertificateArn,
      targetGroup: targetgroup1,
    });

    const app1Certificate = new aws.alb.ListenerCertificate("website-acm", {
      certificateArn: defaultCertificateArn,
      listenerArn: webHttps.listener.arn,
    });

    const site = process.env.GITHUB_REF_NAME !== "master"
      ? `www.${config.get("target")}.evercharge.com`
      : `www.evercharge.com`;

    const rule1 = new awsxClassic.lb.ListenerRule("website-lr1", web, {
      conditions: [{ hostHeader: { values: [site] } }],
      actions: [
        { type: "forward", targetGroupArn: targetgroup1.targetGroup.arn },
      ],
    });

    const ruleHttps1 = new awsxClassic.lb.ListenerRule(
      "website-lr2",
      webHttps,
      {
        conditions: [{ hostHeader: { values: [site] } }],
        actions: [
          { type: "forward", targetGroupArn: targetgroup1.targetGroup.arn },
        ],
      }
    );

    const appService = new awsx.ecs.FargateService("marketing-website", {
      cluster: "marketing-cluster-52429e4",
      assignPublicIp: true,
      taskDefinitionArgs: {
        container: {
          image: image.imageUri,
          portMappings: [
            {
              targetGroup: targetgroup1.targetGroup,
            },
          ],
          environment,
          user: "1000:1000",
          cpu: 4096,
          memory: 8192,
        },
        runtimePlatform: {
          operatingSystemFamily: "LINUX",
          cpuArchitecture: "ARM64",
        },
      },
      desiredCount: 6,
    });
  });
}

main();
