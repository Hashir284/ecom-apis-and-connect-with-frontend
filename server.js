import express from 'express'
import jwt from 'jsonwebtoken'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import pool from './Config/db.js'
import cors from 'cors'
import 'dotenv/config'

const app = express()

app.use(express.json())
app.use(cors())

// File path helpers for ESM module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.get('/api/health', (req, res) => res.send('Your Api is running at Perfectly'))

// ==================== AUTH APIs ====================
app.post('/api/signup', async (req, res) => {
  let reqBody = req.body
  if (!reqBody.first_name || !reqBody.last_name || !reqBody.email || !reqBody.password) {
    return res.status(400).send({ status: 'error', message: 'required parameters Are missing' })
  }
  try {
    await pool.query(
      `INSERT INTO USERS (first_name, last_name, email, password) VALUES ($1,$2,$3,$4)`,
      [reqBody.first_name, reqBody.last_name, reqBody.email, reqBody.password]
    )
    res.status(201).send({ status: 'success', message: `user created with email: ${reqBody.email}` })
  } catch (error) {
    console.log('Err', error)
    if (error.code == '23505') {
      res.status(400).send({ status: 'error', message: 'User Already Logedin With This Email' })
    } else {
      res.status(500).send({ status: 'error', message: 'Internal Server Error' })
    }
  }
})

app.post('/api/login', async (req, res) => {
  const reqBody = req.body
  if (!reqBody.email || !reqBody.password) {
    return res.status(400).send({ status: 'error', message: 'required parameter missing' })
  }
  try {
    const user = await pool.query(`SELECT * FROM users WHERE email = $1 AND is_active = true`, [reqBody.email])
    const currentUser = user.rows[0]

    if (!user.rows.length || reqBody.password != currentUser.password) {
      return res.status(401).send({ status: 'error', message: 'Invalid email or password' })
    }
    delete currentUser.password

    let userToken = jwt.sign(
      {
        ...currentUser,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + 60 * 60 * 24,
      },
      process.env.JWT_SECRET
    )

    res.cookie('Token', userToken, {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      secure: false,
    })

    res.status(200).send({ status: 'success', user: currentUser })
  } catch (error) {
    console.log('Err', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

// ==================== CATEGORY APIs ====================
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
      category: result.rows[0],
    })
  } catch (error) {
    console.error('Error adding category:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

app.get('/api/category', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM categories ORDER BY created_at DESC`)
    res.status(200).send({ status: 'success', categories: result.rows })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).send({ status: 'error', message: 'Internal Server Error' })
  }
})

// ==================== PRODUCT APIs ====================
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
      product: result.rows[0],
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

// ==================== STATIC FILES SERVING ====================
const frontendPath = path.join(__dirname, 'Web', 'dist')
app.use(express.static(frontendPath))

// SPA fallback for React Router routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// Local development server listener
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => {
    console.log('Server is running at http://localhost:4000')
  })
}

export default app