/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
];

const siteConfig = {
  title: 'Semaine du Cerveau 2018 - Levitation VR' /* title for your website */,
  tagline: 'Induced levitation in Google Earth VR connected to a Muse EEG headset',
  url: 'https://alx.github.io/semaine_du_cerveau_2018' /* your website url */,
  baseUrl: '/semaine_du_cerveau_2018/' /* base url for your project */,
  projectName: 'semaine_du_cerveau_2018',
  headerLinks: [
    {doc: 'setup', label: 'Setup'},
    {doc: 'levitate', label: 'Playing'}
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/docusaurus.svg',
  footerIcon: 'img/docusaurus.svg',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#3f51b5',
    secondaryColor: '#455a64',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    'Alexandre Girard',
    organizationName: 'alx', // or set an env variable ORGANIZATION_NAME
    projectName: 'semaine_du_cerveau_2018', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/alx/semaine_du_cerveau_2018',
};

module.exports = siteConfig;
