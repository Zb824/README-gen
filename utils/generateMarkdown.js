
function renderLicenseBadge(license) { 
  const badges = {
    mit: '[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)',
    isc: '[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)',
    apache: '[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)',
    none: ''
  }
  return badges [license]
}


function renderLicenseLink(license) { 
  const licenseLinks = {
    mit: '[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)',
    isc: '[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)',
    apache: '[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)',
    none: ''


  }
  return renderLicenseLink[license]
}

function renderLicenseSection(license) {
  if(license) {
    return 'Licensed under the ${this.renderLicenseLink(license)} license'
  } else {
    return ''
  }
 }


function generateMarkdown(answers) {
  return `
# ${answers.title}
${renderLicenseBadge(answers.license)}



    https://github.com/${answers.github}/${answers.title}

## Table of contents
- [Description](#description)
- [Usage](#usage)
- [Contributions](#contributions)
- [Contact info](#contact-info)
- [License](#license)
- [Installation](#installation)

## Description
    ${answers.description}

## Usage
    Guidelines for installation: ${answers.usage}

## Installation
    ${answers.installation}

## Contributions
    ${answers.contributors}

## Contact info
    ${answers.email}
    ${answers.github}

## License
    ${renderLicenseSection(answers.license)}
    
  
    
`;
}

module.exports = generateMarkdown;

