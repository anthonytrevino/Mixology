const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')
const bcrypt = require('bcryptjs')
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
    password:'',
    ssl:true
}

const db = pgp(cn)



app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.get('/', function(req,res){
        res.render('index')
})
app.get('/index', function(req,res){
    res.render('index')
})
app.get('/register', function(req,res){
    res.render('register')
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
         username = req.body.username
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
//get drink with comments
app.get('/drink_item', function(req, res){

db.any('SELECT * FROM drink_comment WHERE iddrink = $1',[2])
.then(function(result){

    res.render('drink_item', {drink_item: result})
})

})








app.listen(3000,function(req,res){
    console.log("Server has started...")
})
