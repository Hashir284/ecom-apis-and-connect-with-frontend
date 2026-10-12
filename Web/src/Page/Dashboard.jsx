import React, { useEffect, useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../Api/api'
import UserDataProvider, { UserData } from '../Context/Context'

const Dashboard = () => {
  const { user, setUser, setUserLoggedin } = useContext(UserData)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  // Loading States for Buttons
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [isProductLoading, setIsProductLoading] = useState(false)

  // Loading States for Data
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [isProductsLoading, setIsProductsLoading] = useState(true)

  // Category Inputs
  const categoryName = useRef(null)
  const categoryDescription = useRef(null)
  const categoryImageUrl = useRef(null)

  // Product Inputs (Updated for new schema)
  const productName = useRef(null)
  const productBrand = useRef(null)
  const productSku = useRef(null)
  const productPrice = useRef(null)
  const productDiscountPrice = useRef(null)
  const productStock = useRef(null)
  const productCategory = useRef(null)
  const productDescription = useRef(null)
  const productImageUrl = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await api.get('category')
      setCategories(res.data.categories || [])
    } catch (error) {
      console.error('Failed to load categories', error)
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('product')
      setProducts(res.data.products || [])
    } catch (error) {
      console.error('Failed to load products', error)
    } finally {
      setIsProductsLoading(false)
    }
  }

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault()
    const name = categoryName.current.value.trim()
    const description = categoryDescription.current.value.trim()
    const image_url = categoryImageUrl.current.value.trim()

    if (!name) return alert('Please enter category name!')

    setIsCategoryLoading(true)

    try {
      await api.post('category', { name, description, image_url })
      alert('Category added!')
      categoryName.current.value = ''
      categoryDescription.current.value = ''
      categoryImageUrl.current.value = ''
      fetchCategories()
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding category')
    } finally {
      setIsCategoryLoading(false)
    }
  }

  // Add Product Handler (Updated for new fields)
  const handleAddProduct = async (e) => {
    e.preventDefault()
    const name = productName.current.value.trim()
    const brand = productBrand.current.value.trim()
    const sku = productSku.current.value.trim()
    const price = productPrice.current.value
    const discount_price = productDiscountPrice.current.value
    const stock = productStock.current.value
    const category = productCategory.current.value
    const description = productDescription.current.value.trim()
    const imageUrl = productImageUrl.current.value.trim()

    if (!name || !price || !category || !sku || !stock || !imageUrl) {
      return alert('Please fill in all required fields (Name, Price, Category, SKU, Stock, Image URL)!')
    }

    // Backend array expect kar raha hai is liye array mein wrap kar ke bhej rahe hain
    const image_array_product = [imageUrl]

    setIsProductLoading(true)

    try {
      await api.post('product', {
        product_name: name,
        brand,
        sku,
        price,
        discount_price: discount_price || 0,
        stock,
        category,
        description,
        image_array_product
      })

      alert('Product added successfully!')
      productName.current.value = ''
      productBrand.current.value = ''
      productSku.current.value = ''
      productPrice.current.value = ''
      productDiscountPrice.current.value = ''
      productStock.current.value = ''
      productCategory.current.value = ''
      productDescription.current.value = ''
      productImageUrl.current.value = ''
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding product')
    } finally {
      setIsProductLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('logout')
      setUser(null)
      setUserLoggedin(false)
      navigate('/login')
    } catch (error) {
      console.log(error.response)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          My App Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">

        {/* User Info */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user ? `${user.first_name} ${user.last_name}` : 'User'}!
          </h2>

          <p className="text-gray-600 text-sm mt-1">
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
        </div>

        {/* Forms Grid */}
        {
          user?.role?.toLowerCase() === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Add Category Form */}
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Add New Category
                </h3>

                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>

                    <input
                      type="text"
                      ref={categoryName}
                      placeholder="e.g. Electronics, Footwear"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>

                    <input
                      type="url"
                      ref={categoryImageUrl}
                      placeholder="https://example.com/category-image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>

                    <textarea
                      ref={categoryDescription}
                      rows="2"
                      placeholder="Category details..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isCategoryLoading}
                    className={`w-full text-white font-medium py-2 rounded-lg transition ${
                      isCategoryLoading
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isCategoryLoading ? 'Adding Category...' : 'Add Category'}
                  </button>
                </form>
              </div>

              {/* Add Product Form (Updated) */}
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Add New Product
                </h3>

                <form onSubmit={handleAddProduct} className="space-y-3">

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        ref={productName}
                        placeholder="Laptop, Shirt..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        ref={productBrand}
                        placeholder="Nike, Apple..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        ref={productSku}
                        placeholder="SKU-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        ref={productStock}
                        placeholder="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        ref={productPrice}
                        placeholder="99.99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        ref={productDiscountPrice}
                        placeholder="79.99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category *
                    </label>
                    <select
                      ref={productCategory}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image URL *
                    </label>
                    <input
                      type="url"
                      ref={productImageUrl}
                      placeholder="https://example.com/product-image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      ref={productDescription}
                      rows="2"
                      placeholder="Product description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isProductLoading}
                    className={`w-full text-white font-medium py-2 rounded-lg transition ${
                      isProductLoading
                        ? 'bg-green-300 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isProductLoading ? 'Adding Product...' : 'Add Product'}
                  </button>

                </form>
              </div>

            </div>
          )
        }

        {/* Categories Grid */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Categories ({categories.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isCategoriesLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 flex items-start space-x-3 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-md flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 border rounded-lg bg-gray-50 flex items-start space-x-3">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-14 h-14 object-contain rounded-md flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        No Image
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-gray-800 truncate">{cat.name}</h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{cat.description || 'No description'}</p>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-400 text-sm col-span-3">No categories added yet.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Products Grid (Updated to display brand, sku, stock, and discount) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Products ({products.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isProductsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
                  <div className="w-full h-36 bg-gray-200 rounded-md mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              ))
            ) : (
              <>
                {products.map((prod) => (
                  <div key={prod.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col justify-between">
                    <div>
                      {/* Backend mein images array hai, is liye images[0] use kar rahe hain */}
                      {prod.images && prod.images[0] && (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-36 object-contain rounded-md mb-3"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      )}

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {prod.brand || 'Generic'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          SKU: {prod.sku}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-800 mt-1">
                        {prod.name}
                      </h4>

                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <div>
                        {prod.discount_price > 0 ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">${prod.discount_price}</span>
                            <span className="text-gray-400 text-xs line-through">${prod.price}</span>
                          </div>
                        ) : (
                          <span className="text-green-600 font-bold">${prod.price}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <p className="text-gray-400 text-sm col-span-3">No products added yet.</p>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard