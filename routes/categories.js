var express = require('express');
var router = express.Router();
// Import hàm tạo ID tự động
var { IncrementalId } = require('../utils/IncrementalIdHandler');
// Import dữ liệu Products để lọc theo category
var { data: products } = require('../utils/data');

// Giả lập CSDL Categories (từ dữ liệu bạn cung cấp)
var categories = [
  {
    "id": 7,
    "name": "Clothes",
    "slug": "clothes",
    "image": "https://i.imgur.com/QkIa5tT.jpeg",
    "creationAt": "2026-02-05T16:51:34.000Z",
    "updatedAt": "2026-02-05T16:51:34.000Z"
  },
  {
    "id": 8,
    "name": "Electronics",
    "slug": "electronics",
    "image": "https://i.imgur.com/ZANVnHE.jpeg",
    "creationAt": "2026-02-05T16:51:35.000Z",
    "updatedAt": "2026-02-05T16:51:35.000Z"
  },
  {
    "id": 9,
    "name": "Furniture",
    "slug": "furniture",
    "image": "https://i.imgur.com/Qphac99.jpeg",
    "creationAt": "2026-02-05T16:51:36.000Z",
    "updatedAt": "2026-02-05T16:51:36.000Z"
  },
  {
    "id": 10,
    "name": "Shoes",
    "slug": "shoes",
    "image": "https://i.imgur.com/qNOjJje.jpeg",
    "creationAt": "2026-02-05T16:51:36.000Z",
    "updatedAt": "2026-02-05T16:51:36.000Z"
  },
  {
    "id": 11,
    "name": "Miscellaneous",
    "slug": "miscellaneous",
    "image": "https://i.imgur.com/BG8J0Fj.jpg",
    "creationAt": "2026-02-05T16:51:37.000Z",
    "updatedAt": "2026-02-05T16:51:37.000Z"
  },
  {
    "id": 13,
    "name": "gargantilla",
    "slug": "gargantilla",
    "image": "https://firebasestorage.googleapis.com/v0/b/pruebasalejandro-597ed.firebasestorage.app/o/gargantilla.jpg?alt=media&token=6bbf8234-5112-4ca8-b130-5e49ed1f3140",
    "creationAt": "2026-02-05T21:09:36.000Z",
    "updatedAt": "2026-02-05T21:09:36.000Z"
  },
  {
    "id": 15,
    "name": "category_B",
    "slug": "category-b",
    "image": "https://pravatar.cc/",
    "creationAt": "2026-02-05T22:04:27.000Z",
    "updatedAt": "2026-02-05T22:04:27.000Z"
  },
  {
    "id": 16,
    "name": "string",
    "slug": "string",
    "image": "https://pravatar.cc/",
    "creationAt": "2026-02-05T22:04:28.000Z",
    "updatedAt": "2026-02-05T22:04:28.000Z"
  },
  {
    "id": 17,
    "name": "Anillos",
    "slug": "anillos",
    "image": "https://firebasestorage.googleapis.com/v0/b/pruebasalejandro-597ed.firebasestorage.app/o/Anillos.jpg?alt=media&token=b7de8064-d4eb-4680-a4e2-ad917838c6c8",
    "creationAt": "2026-02-06T02:40:20.000Z",
    "updatedAt": "2026-02-06T02:40:20.000Z"
  },
  {
    "id": 18,
    "name": "Testing Category",
    "slug": "testing-category",
    "image": "https://placeimg.com/640/480/any",
    "creationAt": "2026-02-06T06:04:54.000Z",
    "updatedAt": "2026-02-06T06:04:54.000Z"
  }
];

// --- CÁC HÀM HTTP REQUEST ---

// 1. Get All Categories (Có hỗ trợ lọc theo name)
// URL: /api/v1/categories?name=Shoes
router.get('/', function(req, res, next) {
  const { name } = req.query;
  let result = categories;

  if (name) {
    result = categories.filter(c => 
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  res.json(result);
});

// 2. Get By ID
// URL: /api/v1/categories/7
router.get('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  // Nếu param id là 'slug' thì bỏ qua để route slug xử lý (đề phòng conflict nếu đặt sai thứ tự)
  if (isNaN(id)) return next();

  const category = categories.find(c => c.id === id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

// 3. Get By Slug
// URL: /api/v1/categories/slug/clothes
router.get('/slug/:slug', function(req, res, next) {
  const slug = req.params.slug;
  const category = categories.find(c => c.slug === slug);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

// 4. Get Products by Category ID
// URL: /api/v1/categories/{id}/products
router.get('/:id/products', function(req, res, next) {
  const id = parseInt(req.params.id);
  
  // Kiểm tra category có tồn tại không
  const categoryExists = categories.some(c => c.id === id);
  if (!categoryExists) {
    return res.status(404).json({ message: 'Category not found' });
  }

  // Lọc products từ file utils/data.js
  // Dựa vào cấu trúc product: { category: { id: 7, ... } }
  const categoryProducts = products.filter(p => p.category && p.category.id === id);

  res.json(categoryProducts);
});

// 5. Create Category
router.post('/', function(req, res, next) {
  const { name, slug, image } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'Name and Slug are required' });
  }

  // Sử dụng hàm IncrementalId bạn cung cấp
  const newId = IncrementalId(categories);

  const newCategory = {
    id: newId,
    name,
    slug,
    image: image || "https://placeimg.com/640/480/any",
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// 6. Edit Category
router.put('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const currentCategory = categories[index];
  const { name, slug, image } = req.body;

  const updatedCategory = {
    ...currentCategory,
    name: name || currentCategory.name,
    slug: slug || currentCategory.slug,
    image: image || currentCategory.image,
    updatedAt: new Date().toISOString()
  };

  categories[index] = updatedCategory;
  res.json(updatedCategory);
});

// 7. Delete Category
router.delete('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const deletedCategory = categories.splice(index, 1);
  res.json({ message: 'Deleted successfully', category: deletedCategory[0] });
});

module.exports = router;