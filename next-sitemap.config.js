/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || "https://hkbus.app/",
  generateRobotsTxt: true,
};

module.exports = config;
