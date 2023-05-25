import fs from 'fs';
import csv from 'csv-parser';
import { Command } from '@commander-js/extra-typings';
import figlet from "figlet";
import path from 'path';

//add the following line
const program = new Command()
    .requiredOption('--signups-file <file>', 'Signups CSV file')
    .requiredOption('--insights-file <file>', 'Insights CSV file');

program.parse(process.argv);
const options = program.opts();

type signup = {
  first_name: string, 
  last_name: string, 
  email: string, 
  company: string, 
  github: string, 
  db_primary: string, 
  date_submitted: string, 
  token: string,
  [key: string]: any
}

type insight = {
  [key: string]: any
}

// console.log(options.signupsFile)
// console.log(options.insightsFile)
// console.log(figlet.textSync("Dir Manager"));

function convertStringToArray(record: any, fieldName: string) {
  record[fieldName] = record[fieldName].split(',').map((item: string) => item.trim());
}

async function readCSVFile<Type>(filePath: string, header: Array<string>, multiValuedFields: Array<string>): Promise<Type[]> {
    const results: Type[] = [];
  
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv(header))
        .on('data', (data) => {
          for (var val of multiValuedFields) {
            convertStringToArray(data, val);
          }
          results.push(data)
        })
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

async function processFiles() {

  var signups: signup[] = [];
  var insights: object[] = [];
  await readCSVFile<signup>(path.resolve(options.signupsFile), 
    ['first_name', 'last_name', 'email', 'company', 'github', 'db_primary', 'date_submitted', 'token'],
    [])
  .then((data) => {
    signups = data as signup[];
  })
  .catch((error) => {
    console.log(error);
  })


  await readCSVFile<insight>(path.resolve(options.insightsFile), 
    ['email', 'use_cases', 'db_primary', 'db_hosting', 'security_controls', 'app_hosting', 'db_changes_comfort', 'async_tech', 'project_purpose', 'project_description', 'date_submitted', 'token'],
    ['use_cases', 'security_controls', 'db_hosting', 'app_hosting', 'async_tech', 'project_purpose'])
  .then((data) => {
    insights = data as insight[];
  })
  .catch((error) => {
    console.log(error);
  })

  for (var val of signups) {
    const email = val['email' as keyof typeof val];
    const matchingInsight = insights.find(element => element['email' as keyof typeof element] === email);
    if (matchingInsight) {
      
      val['use_cases'] = matchingInsight['use_cases' as keyof typeof matchingInsight];
      val['db_hosting'] = matchingInsight['db_hosting' as keyof typeof matchingInsight];
      val['security_controls'] = matchingInsight['security_controls' as keyof typeof matchingInsight];
      val['app_hosting'] = matchingInsight['app_hosting' as keyof typeof matchingInsight];
      val['db_changes_comfort'] = matchingInsight['db_changes_comfort' as keyof typeof matchingInsight];
      val['async_tech'] = matchingInsight['async_tech' as keyof typeof matchingInsight];
      val['project_purpose'] = matchingInsight['project_purpose' as keyof typeof matchingInsight];
      val['project_description'] = matchingInsight['project_description' as keyof typeof matchingInsight];
      console.log(JSON.stringify(val));
    }
    
  }
}


processFiles();
