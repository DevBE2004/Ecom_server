const userRouter = require('./user')
const productRouter = require('./product')
const categoryRouter = require('./productCategory')
const blogCategoryRouter = require('./blogCategory')
const blogRouter = require('./blog')
const brandRouter = require('./brand')
const couponRouter = require('./coupon')
const orderRouter = require('./order')
const dataRouter = require('./insertdata')
const { notFound, errorHandler } = require('../middlewares/errHandler')

function router(app) {

    app.use('/user', userRouter)
    app.use('/product', productRouter)
    app.use('/category', categoryRouter)
    app.use('/blogcategory', blogCategoryRouter)
    app.use('/blog', blogRouter)
    app.use('/brand', brandRouter)
    app.use('/coupon', couponRouter)
    app.use('/order', orderRouter)
    app.use('/insert',dataRouter)







    app.use(notFound)
    app.use(errorHandler)
}

module.exports = router