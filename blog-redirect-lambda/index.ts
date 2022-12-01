import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

async function main() {
  const endpoint = new awsx.classic.apigateway.API("blog-redirect", {
    routes: [
      {
        path: "/",
        method: "ANY",
        eventHandler: async (event) => {
          console.log(event);
          return {
            statusCode: 301,
            headers: {
              Location: `https://evercharge.com/blog${event.path}`,
            },
            body: `Redirecting to https://evercharge.com/blog${event.path}`,
          };
        },
      },
      {
        path: "/{proxy+}",
        method: "ANY",
        eventHandler: async (event) => {
          console.log(event);
          return {
            statusCode: 301,
            headers: {
              Location: `https://evercharge.com/blog${event.path}`,
            },
            body: `Redirecting to https://evercharge.com/blog${event.path}`,
          };
        },
      },
    ],
  });

  const domainCom = new aws.apigateway.DomainName("blog-redirect-com", {
    certificateArn:
      "arn:aws:acm:us-east-1:368872628473:certificate/184ca248-36b0-414a-ab10-736bb446874e",
    domainName: "blog.evercharge.com",
  });

  const domainNet = new aws.apigateway.DomainName("blog-redirect-net", {
    certificateArn:
      "arn:aws:acm:us-east-1:368872628473:certificate/184ca248-36b0-414a-ab10-736bb446874e",
    domainName: "blog.evercharge.net",
  });

  const basePathMappingCom = new aws.apigateway.BasePathMapping(
    "blog-redirect-com",
    {
      restApi: endpoint.restAPI,
      stageName: endpoint.stage.stageName,
      domainName: domainCom.domainName,
    }
  );

  const basePathMappingNet = new aws.apigateway.BasePathMapping(
    "blog-redirect-net",
    {
      restApi: endpoint.restAPI,
      stageName: endpoint.stage.stageName,
      domainName: domainNet.domainName,
    }
  );

  const route53Zone = aws.route53.getZone({
    name: "evercharge.com",
  });

  const route53RecordCom = new aws.route53.Record("blog-redirect-com", {
    name: "blog.evercharge.com",
    zoneId: route53Zone.then((zone) => zone.zoneId),
    type: "A",
    allowOverwrite: true,
    aliases: [
      {
        name: domainCom.cloudfrontDomainName,
        zoneId: domainCom.cloudfrontZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });

  const route53RecordNet = new aws.route53.Record("blog-redirect-net", {
    name: "blog.evercharge.net",
    zoneId: route53Zone.then((zone) => zone.zoneId),
    type: "A",
    allowOverwrite: true,
    aliases: [
      {
        name: domainNet.cloudfrontDomainName,

        zoneId: domainNet.cloudfrontZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });
}
main();
