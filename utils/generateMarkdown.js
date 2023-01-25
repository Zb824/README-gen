// TODO: Create a function that returns a license badge based on which license is passed in
// If there is no license, return an empty string
function renderLicenseBadge(license) { 
  const badges = {
    mit: [],
    isc: [],
    apache: [],
    none:[]
  }
}

// TODO: Create a function that returns the license link
// If there is no license, return an empty string
function renderLicenseLink(license) { }

// TODO: Create a function that returns the license section of README
// If there is no license, return an empty string
function renderLicenseSection(license) { }

// TODO: Create a function to generate markdown for README
function generateMarkdown(answers) {
  return `
# ${answers.title}
    https://github.com/${answers.github}/${answers.title}

## Table of contents
    - [Project description](#description)
    - [Usage](#usage)
    - [Contributions](#contributing)
    - [Contact info](#contact info)
    - [License](#license)

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
    ${answers.license}
    
  
    
`;
}

module.exports = generateMarkdown;

