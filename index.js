const inquirer = require('inquirer')
const fs = require ('fs')

const generateMarkdown = require('./util/generateMarkdown.js');



const questions = [
  {
    type: 'input',
    message:'What is the title of your project?',
    name: 'title'
  },
  {
    type: 'input',
    message:'Please provide a brief description of your project',
    name: 'description'
  },
  {
    type: 'input',
    message:'What does the user need to install to run this app?',
    name: 'installation'
  },
  {
    type:'input',
    message: 'Table of Contents',
    name: 'table of contents'
  },
  {
    type: 'input',
    message: 'How is the app used? Provide instructions',
    name: 'usage'
  },
  {
    type:'list',
    message:'What license did you use?',
    name:'license',
    choices: ["none", "MIT", "Apache License 2.0"]

  },
  {
    type: 'input',
    name: 'questions',
    message: "How should people contact you?",
  },
  {
    type: 'input',
    name: 'github',
    message: "What is your GitHub username?",
  },
  {
    type: 'input',
    name: 'email',
    message: "What is your email?",
  },
  {
    type: 'input',
    name: 'contributors',
    message: "Who contributed to your project?",
  }
]






function makeDirectory() { 
  if (!fs.existsSync("./output")) {
    fs.mkdir("./output", function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Success!");
      }
    });
  } else {
    console.log("Directory file already exists.");
  }
  
}


function writeToFile(fileName, data) {
  fs.writeFile(fileName, data, err => {
    err ? console.error(err) : console.log('Success, Your README file has been created. ')
  });
}



function init() {
  inquirer.prompt(questions).then(answers => {
    makeDirectory();
    writeToFile("./output/README.md", md.generateMarkdown(answers));
  });
}


init();



