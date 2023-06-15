
// making sure user enters correct incorrect spelling we check and make correct meaning out of it

import SpellCorrector from 'spelling-corrector'
import aposToLexForm from 'apos-to-lex-form'
import readline from "readline"
import natural from 'natural'

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const userInterface=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})

userInterface.prompt()

userInterface.on("line",async (input)=>{
  //let naturalProcess=natural.PorterStemmer.tokenizeAndStem(input)
  let review='stability is high thin ever'
  const lexedReview = aposToLexForm(review);
  console.log(lexedReview,'lexedReview')
  const casedReview = lexedReview.toLowerCase();
  console.log(casedReview,'casedReview')
  const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
  console.log(alphaOnlyReview,'alphaOnlyReview')

  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
   const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
  console.log(tokenizedReview,'tokenizedReview --before')

  tokenizedReview.forEach((word, index) => {
    tokenizedReview[index] = spellCorrector.correct(word);
  })
  console.log(tokenizedReview,'tokenizedReview --after')
  console.log(tokenizedReview.join(" "),'tokenizedReview -- stringifiled')

//  naturalProcess.forEach((word, index) => {
//     naturalProcess[index] = spellCorrector.correct(word);
//   })
//   console.log(naturalProcess,'tokenizedReview --after')
})

