## 📄 1. Setup Environment Variables
Copy file example:

```bash
cp .env.example .env
```

```
DATABASE_URL_POSTGRES="postgresql://products_user:password@127.0.0.1:5432/products_db?schema=public"
DATABASE_URL_MYSQL="mysql://ratings_user:password@127.0.0.1:3306/ratings_db"
```

---

## 📥 2. Install Dependencies

```bash
yarn install
```

---

## 🔧 3. Generate Prisma Clients
Jalankan migrate untuk kedua database:

```bash
npx prisma generate --schema=prisma/products.prisma
npx prisma generate --schema=prisma/ratings.prisma
```

Ini akan menghasilkan Prisma Client di:
```
node_modules/.prisma/products
node_modules/.prisma/ratings
```

---

## ▶️ 4. Runing Dev
Mode development:

```bash
yarn start:dev
```

Aplikasi berjalan di:
```
http://localhost:3000
```

---

## 📘 5. API Documentation (Swagger)
Swagger dapat diakses pada:
```
http://localhost:3000/docs
```

