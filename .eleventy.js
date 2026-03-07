const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Custom filter: format a date using Luxon (e.g. for sitemap.njk)
  eleventyConfig.addFilter("dateToFormat", (date, format) => {
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(format);
  });

  // Pass through static assets (copy as-is to _site/)
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  // Watch for changes in CSS and JS during development
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");

  return {
    // Use Liquid as the templating engine for .html files
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    dataTemplateEngine: "liquid",

    dir: {
      input: "src", // Source directory
      includes: "_includes", // Relative to input dir: src/_includes/
      layouts: "_layouts", // Relative to input dir: src/_layouts/
      data: "_data", // Relative to input dir: src/_data/
      output: "docs", // Build output directory
    },
  };
};
