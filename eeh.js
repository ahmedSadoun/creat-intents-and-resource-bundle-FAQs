import reader from "xlsx";
import fs, { copyFileSync } from "fs";

import * as sw from "stopword";
// var natural = require('natural');

import natural from "natural";

// import PorterStemmer from "natural/lib/natural/stemmers/porter_stemmer.js";
// PorterStemmer.attach();

class ReadXLsFile {
  readFile(path) {
    const file = reader.readFile(path);
    const sheets = file.SheetNames;
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
    return temp;
  }
}

class WriteXLsFile {
  writeToFile(fileName, data) {
    let { JsonEntries, queriesEntries, answerEntries } =
      this.createJsonEntries(data);
    const sheet = reader.utils.json_to_sheet(JsonEntries);
    const queries = reader.utils.json_to_sheet(queriesEntries);
    const answers = reader.utils.json_to_sheet(answerEntries);
    let stream = reader.stream.to_csv(sheet);
    let queryStream = reader.stream.to_csv(queries);
    let answersStream = reader.stream.to_csv(answers);
    let path = this.createPath(fileName);
    stream.pipe(fs.createWriteStream(path));
    queryStream.pipe(fs.createWriteStream("./queryRB.csv"));
    answersStream.pipe(fs.createWriteStream("./answersRB.csv"));
    console.log("File created on path " + path);
    console.log("File created on path ./queryRB.csv");
    console.log("File created on path ./answersRB.csv");
  }
  createPath(fileName) {
    fileName = fileName.trim();
    return `./${fileName}.csv`;
  }
  entryFormate() {
    let answerIntentFormat = {
      query: "",
      topIntent: "",
      conversationName: "",
      description: "",
      answer: "",
      enabled: true,
    };
    return answerIntentFormat;
  }
  RBQueryEntryFormate() {
    let answerIntentFormat = {
      languageTag: "ar",
      key: "systemFlowName_",
      message: "أسئلة شائعة:  ",
      annotation: "",
    };
    return answerIntentFormat;
  }
  RBAnswerEntryFormate() {
    let answerIntentFormat = {
      languageTag: "ar",
      key: "systemAnswer_",
      message: "",
      annotation: "",
    };
    return answerIntentFormat;
  }
  createJsonEntries(data) {
    let JsonEntries = [];
    let queriesEntries = [];
    let answerEntries = [];
    data.forEach((element) => {
      // repeat every row twice to solve the increase the utterances
      if (element.query) {
        for (let index = 0; index < 2; index++) {
          let answerIntent = this.entryFormate();
          let queryRBFormat = this.RBQueryEntryFormate();
          let answerRBFormat = this.RBAnswerEntryFormate();

          answerIntent.topIntent =
            "ANS.FAQs." +
            this.createManipulatedQuery(
              element.product.trim(),
              element.query.trim()
            ); //intenName.replace(/[^A-Z0-9]+/gi, ".");

          var retailCorpFlag = answerIntent.topIntent.includes(".ret.")
            ? index != 0
              ? "Retail - "
              : "أفراد - "
            : answerIntent.topIntent.includes(".corp.")
            ? index != 0
              ? "Corp - "
              : "شركات - "
            : "";

          answerIntent.query =
            index != 0
              ? retailCorpFlag + element.query.trim()
              : retailCorpFlag + element.trnaslatedARQuery.trim(); // .substring(0, element.query.length - 1); //

          queryRBFormat.key = queryRBFormat.key + answerIntent.topIntent;
          queryRBFormat.message = queryRBFormat.message + element.queryAR;

          answerRBFormat.key = answerRBFormat.key + answerIntent.topIntent;
          answerRBFormat.message = element.answerAR.replace("”", "");

          answerIntent.conversationName =
            "FAQ: " + retailCorpFlag + element.query; // "FAQs: " + element.product + "#" //answerIntent.topIntent; //
          answerIntent.answer = element.answer.replace("”", "");

          JsonEntries.push(answerIntent);
          queriesEntries.push(queryRBFormat);
          answerEntries.push(answerRBFormat);
        }
      }
    });
    return {
      JsonEntries,
      queriesEntries,
      answerEntries,
    };
  }

  createManipulatedQuery(product, query) {
    if (!query) {
      return "NO QUERY";
    }

    query = query.toLowerCase();
    product = product.toLowerCase();

    query = query.replace(/[\?\.,\/#!$%\^&\*;:{}=\-_`~()’'"”+]/g, " ");
    query = query.replace(/\s+/g, " ").trim();

    product = product.replace(/[\?\.,\/#!$%\^&\*;:{}=\-_`~()’'"”]/g, " ");
    product = product.replace(/\s+/g, " ").trim();

    query = query.replace(/[0-9]+/g, " ");
    query = query.replace("information", "info");
    query = query.replace("required", "req");
    query = query.replace("application", "app");
    query = query.replace("maximum", "max");
    query = query.replace("minimum", "min");
    query = query.replace("retail", "ret");
    query = query.replace("corporates", "corp");
    query = query.replace("corporate", "corp");
    query = query.replace("certificates", "cert");
    query = query.replace("certificate", "cert");
    query = query.replace("accounts", "acc");
    query = query.replace("account", "acc");

    query = query
      .split(" ")
      .filter((word) => !product.split(" ").includes(word));

    query = sw.removeStopwords(query, [
      "nbe",
      "al ahly",
      "via",
      "service",
      "services",
      "corporates",
      "corporate",
      "does",
    ]);
    query = sw.removeStopwords(query);
    query = query.filter((item, index) => query.indexOf(item) === index);
    query = query.map((word) => natural.PorterStemmer.stem(word)); //
    query = query.join(".");

    product = sw.removeStopwords(product.split(" ")).join(".");
    product = product.replace("al.ahly.net", "alAhlyNet");
    product = product.replace("al.ahly.platinum", "alAhlyPlatinum");
    product = product.replace("al.ahly.points", "alAhlyPoints");
    product = product.replace(".e.", ".e-");
    product = product.replace("al.ahly.e-shopping", "alAhlyE-Shopping");
    product = product.replace("al.ahly.phonecash", "alAhlyPhoneCash");
    product = product.replace("retail", "ret");
    product = product.replace("corporates", "corp");
    product = product.replace("corporate", "corp");
    product = product.replace("certificates", "cert");
    product = product.replace("certificate", "cert");
    product = product.replace("accounts", "acc");
    product = product.replace("account", "acc");

    query = query.replace(/\.+/g, ".");
    query = query.replace(/\.s\./g, ".");

    return product + "." + query;
  }
}

let filePath = "./nbe QandA ar and en.xlsx";
let readFile = new ReadXLsFile();
let writeToFile = new WriteXLsFile();

let data = readFile.readFile(filePath);
writeToFile.writeToFile("intentsWithNewUtterances", data);
