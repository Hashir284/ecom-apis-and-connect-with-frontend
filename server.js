import express from 'express'
import jwt from 'jsonwebtoken'
import path, { dirname } from 'path'
import pool from './Config/db.js'
import cors from 'cors'
import 'dotenv/config'
import { stat } from 'fs'

const app = express()

app.use(express.json())

app.use(cors({ origin: ["http://localhost:3000", "*"], credentials: true }))

app.get('/api/health', (req, res) => res.send('Your Api is running at Perfectly'))

app.post('/api/signup', async (req, res) => {
  let reqBody = req.body
  if (!reqBody.first_name || !reqBody.last_name || !reqBody.email || !reqBody.password) {
    res.status(400).send({ status: "error", message: 'required parameters Are missing' })
    return
  }
  try {
    await pool.query(
      `INSERT INTO USERS (first_name, last_name, email, password) VALUES ($1,$2,$3,$4)`,
      [reqBody.first_name, reqBody.last_name, reqBody.email, reqBody.password]
    )
    res.status(201).send({ status: "success", message: `user created with email: ${reqBody.email}` })
  } catch (error) {
    console.log("Err", error);
    if (error.code == '23505') {
      res.status(400).send({ status: "error", message: "User Already Logedin With This Email" })
    } else {
      res.status(500).send({ status: "error", message: "Internal Server Error" })
    }
  }
})

app.post('/api/login', async (req, res) => {
  const reqBody = req.body;
  if (!reqBody.email || !reqBody.password) {
    res.status(400).send({ status: "error", message: "required parameter missing" })
    return;
  }
  try {
    const user = await pool.query(`SELECT * FROM users WHERE email = $1 AND is_active = true`, [reqBody.email])
    const currentUser = user.rows[0]

    if (!user.rows.length || reqBody.password != currentUser.password) {
      res.status(401).send({ status: "error", message: "Invalid email or password" })
      return
    }
    delete currentUser.password

    let userToken = jwt.sign({
      ...currentUser,
      iat: Date.now() / 1000,
      exp: (Date.now() / 1000) + (60 * 60 * 24),
    }, process.env.JWT_SECRET)

    res.cookie('Token', userToken, {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      secure: false
    })

    res.status(200).send({ status: 'success', user: currentUser })
  } catch (error) {
    console.log("Err", error);
    res.status(500).send({ status: "error", message: "Internal Server Error" })
  }
})

app.post('api/logout', (req,res)=>{
  if (req?.cookies?.Token)req.clearCookie('Token')
  res.send({ status:'success', message:'Logged Out' })
})

app.use('/api/*splat', (req, res, next) => {
  let { Token } = req?.cookies?.Token
  if (!Token) {
    res.status(401).send({ status: "error", message: 'UnAuthorized' })
    return
  }

  jwt.verify(Token, process.env.JWT_SECRET, (err, decodedData) => {
    if (!err) {
      res.status(401).send({ status: "error", message: 'Expired Token' })
      let currentTime = Date.now()
      if (decodedData.exp < currentTime) {
        res.cookie('Token', '', {
          maxAge: 1,
          httpOnly: false,
          secure: false
        })
        return
      }

      let user = decodedData
      delete user.iat
      delete user.exp
      req.user = userData

    }

    else{
      res.status(401).send({ status:'error', message: "invalid token" })
    }
  })
})

app.get('api/me', (req, res)=>{
  res.send({status:'success', user:req.user})
})


app.post('/api/category', async (req, res) => {
  const { name, description, image_url } = req.body
  if (!name) {
    return res.status(400).send({ status: 'error', message: 'Category name is required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *`,
      [name, description || '', image_url || '']
    )
    res.status(201).send({
      status: 'success',
      message: 'Category added successfully',
      category: result.rows[0]
    })
  } catch (error) {
    console.error('Error adding category:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

// 2. Get All Categories
app.get('/api/category', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM categories ORDER BY created_at DESC`)
    res.status(200).send({ status: 'success', categories: result.rows })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

app.post('/api/product', async (req, res) => {
  const { title, price, category_id, description, image_url } = req.body
  if (!title || !price || !category_id) {
    return res.status(400).send({ status: 'error', message: 'Title, price, and category are required' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (title, price, category_id, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, price, category_id, description || '', image_url || '']
    )
    res.status(201).send({
      status: 'success',
      message: 'Product added successfully',
      product: result.rows[0]
    })
  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

app.get('/api/product', async (req, res) => {
  try {
    const queryText = `
      SELECT p.id, p.title, p.price, p.description, p.image_url, p.created_at, c.name AS category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `
    const result = await pool.query(queryText)
    res.status(200).send({ status: 'success', products: result.rows })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

const __dirname = path.resolve()
const __frontend = path.join(__dirname, './Web/dist')
app.use('/', express.static(__frontend))
app.use("/*splat", express.static(__frontend))

app.listen(4000, () => {
  console.log('You Server is runnig at http://localhost:4000')
})