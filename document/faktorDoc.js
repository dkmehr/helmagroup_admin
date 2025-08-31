/**
 * @swagger
 * /list-product:
 *   post:
 *     summary: Retrieve the products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               test:
 *                 type: string
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Product ID
 *                       title:
 *                         type: string
 *                         description: Title of the product
 *                       sku:
 *                         type: string
 *                         description: Product Unique Code
 *                       weight:
 *                         type: string
 *                         description: Product Weight
 *                       isMojood:
 *                         type: boolean
 *                         description: Product Availability
 *                       imageUrl:
 *                         type: string
 *                         description: Product local image URL
 *                       thumbUrl:
 *                         type: string
 *                         description: Product local thumbnail URL
 *                 categoryList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: Category Link
 *                       title:
 *                         type: string
 *                         description: Title of the Category
 *                 size:
 *                   type: number
 *                   description: Total number of products
 */

/**
 * @swagger
 * /fetch-product:
 *   post:
 *     summary: Retrieve single product data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Product ID
 *                       title:
 *                         type: string
 *                         description: Title of the product
 *                       sku:
 *                         type: string
 *                         description: Product Unique Code
 *                       weight:
 *                         type: string
 *                         description: Product Weight
 *                       isMojood:
 *                         type: boolean
 *                         description: Product Availability
 *                       imageUrl:
 *                         type: string
 *                         description: Product local image URL
 *                       thumbUrl:
 *                         type: string
 *                         description: Product local thumbnail URL
 *                 categoryList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       link:
 *                         type: string
 *                         description: Category Link
 *                       title:
 *                         type: string
 *                         description: Title of the Category
 *                 size:
 *                   type: number
 *                   description: Total number of products
 */