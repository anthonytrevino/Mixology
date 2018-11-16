const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')
const bcrypt = require('bcryptjs')
const cocktailAPI = `https://www.thecocktaildb.com/api/json/v1/1/`
var fetch = require('node-fetch')
let username
app.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: false
  }))

const pgp = require('pg-promise')()
const cn = {
    host : 'ec2-54-83-38-174.compute-1.amazonaws.com',
    port : 5432,
    database : 'daa7lr4594n063',
    user: 'moqnblcbwdcfsg',
    password:'7d60c59b692b1f04f93c992a2226b602d1ea263c8e4d4ea2fad603749245f0b6',
    ssl:true
}
const db = pgp(cn)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

//Kevin's Work
app.post('/getSingleCocktail', function (req, res) {
  let drinkID = req.body.drinkID
  fetch(cocktailAPI + "lookup.php?i=" + drinkID).then(res => res.json()).then(json => {
    json.drinks.map(function (drink) {
      drink.drinkIngredients = []
      drink.ingredients = []
      drink.proportions = []


      Object.keys(drink).map(function (key, value) {

        if (key.startsWith("strIngredient")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.ingredients.push({
              ingredient: drink[key]
            })
          }
        }
        if (key.startsWith("strMeasure")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.proportions.push({
              proportion: drink[key]
            })

          }

        }
      })

      for (i = 0; i < drink.ingredients.length; i++) {
        if (drink.proportions[i] == undefined) {
          drink.proportions[i] = "nothing m8"
        }
        drink.drinkIngredients.push({
          proportion: drink.proportions[i].proportion,
          ingredient: drink.ingredients[i].ingredient
        })
        console.log(drink.drinkIngredients[i])
      }


    })
    res.render('drink', {
      drinks: json.drinks
    })
  })
})

app.post('/getCocktails', function (req, res) {
  let serchTerm = req.body.query

  fetch(cocktailAPI + "search.php?s=" + serchTerm).then(res => res.json()).then(json => {
    //console.log(json)

    json.drinks.map(function (drink) {
      drink.drinkIngredients = []
      drink.ingredients = []
      drink.proportions = []


      Object.keys(drink).map(function (key, value) {

        if (key.startsWith("strIngredient")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.ingredients.push({
              ingredient: drink[key]
            })
          }
        }
        if (key.startsWith("strMeasure")) {
          if (drink[key] != '' && drink[key] != null && drink[key] != ' ') {
            drink.proportions.push({
              proportion: drink[key]
            })

          }

        }
      })

      for (i = 0; i < drink.ingredients.length; i++) {
        if (drink.proportions[i] == undefined) {
          drink.proportions[i] = "nothing m8"
        }
        drink.drinkIngredients.push({
          proportion: drink.proportions[i].proportion,
          ingredient: drink.ingredients[i].ingredient
        })

      }


    })



    //console.log(drink.ingredients)
    res.render('result', {
      drinks: json.drinks
    })

  })

})


app.post('/register', function(req,res){
        let username = req.body.username
        let password = req.body.password
        let encrypted_password = bcrypt.hashSync(password,10)
        db.none('INSERT INTO user_account(username,password) VALUES($1,$2)',[username, encrypted_password])
        .then(function(){
           res.redirect('index')
        })
        .catch(function(error){
            console.log(error)
        })
    })

    app.post('/login', function(req, res){
        let username = req.body.username
        let password = req.body.password
        db.any('SELECT userid, username, password FROM user_account WHERE username =$1',[username])
        .then(function(result){
            let user = result.find(function(user){
               if(bcrypt.compareSync(password, user.password)){
                   return user.username == username
               }else{
                   console.log('error')
               }

            })
            if(user != null){
                if(user.username){
                    req.session.username=username
                   console.log(user.username)
                    res.redirect('drink_item')
                }
            }else{
                res.redirect('index')
            }

        })
    })

//post comments to db
app.post('/enter_comment', function(req,res){
    let iddrink = req.body.iddrink
    console.log(username)
    let enter_comment = req.body.enter_comment
db.none('INSERT INTO user_comment(iddrink,drink_comment,time_stamp, username) VALUES($1,$2,$3,$4)',[iddrink,enter_comment,new Date(),username])
res.redirect('drink_item')
})

app.get('/', function(req,res){
        res.render('index')
})
app.get('/index', function(req,res){
    res.render('index')
})
app.get('/register', function(req,res){
    res.render('register')
})
//get drink with comments
app.get('/drink_item', function(req, res){

db.any('SELECT * FROM drink_comment WHERE iddrink = $1',[2])
.then(function(result){
    res.render('drink_item', {drink_item: result})
})
})

app.get('/dashboard',function(req,res){
  res.render('dashboard')
})

app.listen(3000,function(req,res){
    console.log("Server has started...")
})
