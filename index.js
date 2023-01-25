const inquirer = require('inquirer')
const fs = require ('fs')

const generateMarkdown = require('./utils/generateMarkdown.js');



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
    type: 'input',
    message: 'How is the app used? Provide instructions',
    name: 'usage'
  },
  {
    type:'list',
    message:'What license did you use?',
    name:'license',
    choices: ["none", "MIT", "Apache License 2.0", "ISC"],
    filter:(val) => {
      return val.toLowerCase();
    }

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
  },
  
]


function runQuery () {
  return inquirer.prompt(questions)
    .then((answers) => {
      const markdown = generateMarkdown(answers)
      fs.writeFile('READMEexample.md', markdown, function(err) {
        if(err){
          console.log('Could not save file')
        } else {
            console.log ('Success: new README.md file generated')
        }
        
      })
      return answers
    })
    .catch((err)=>{
      console.log(err)
    
  })
  
}



runQuery(); {

}