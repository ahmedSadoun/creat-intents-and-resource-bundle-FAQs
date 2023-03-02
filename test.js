import sw from "remove-stopwords";
function convert(product, query) {
  query = query.toLowerCase();
  product = product.toLowerCase();

  query = query.replace(/[\?\.,\/#!$%\^&\*;:{}=\-_`~()’'"”]/g, " ");
  product = product.replace(/[\?\.,\/#!$%\^&\*;:{}=\-_`~()’'"”]/g, " ");

  query = query.replace(/[0-9]+/g, " ");

  query = query.replace(/ +/g, " ").trim();
  product = product.replace(/ +/g, " ").trim();

  query = sw.removeStopwords(query.split(" "), product.split(" "));
  console.log(product.split(" "));
  console.log("the query after product words removal\n " + query);
  query = sw.removeStopwords(query, ["nbe", "al ahly", "via", "service"]);

  product = sw.removeStopwords(product.split(" ")).join(".");
  product = product.replace("al.ahly.net", "alAhlyNet");
  product = product.replace("al.ahly", "alAhly");
  product = product.replace(".nbe", "");
  query = sw.removeStopwords(query).join(".");
  query = query.replace("al.ahly.net", "");
  query = query.replace("al.ahly", "");
  query = query.replace(".nbe", "");

  // query = query.replace("'s", "");
  // query = query.replace("/", "O");
  query = query.replace(/\.+/g, ".");
  query = query.replace(/\.s\./g, ".");
  query = query.replace("Information", "info");
  query = query.replace("required", "req");
  query = query.replace("subscription", "sub");
  query = query.replace("application", "app");
  query = query.replace("maximum", "max");
  query = query.replace("minimum", "min");

  return "ans.faqs." + product + "." + query;
}
let product = "Accounts, certificates and saving pools";
let query =
  "What are the terms of the foreign currency certificates issued by NBE?";
console.log(convert(product, query));
