const express = require('express');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// All routes protected and admin only
router.use(protect);
router.use(admin);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalRevenue,
            lastMonthRevenue,
            totalOrders,
            lastMonthOrders,
            totalProducts,
            newProducts,
            totalUsers,
            newUsers
        ] = await Promise.all([
            Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.aggregate([{ $match: { status: 'delivered', createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Product.countDocuments(),
            Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;
        const revenueChange = lastMonthRev > 0 ? ((revenue - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                totalRevenue: revenue,
                totalOrders,
                totalProducts,
                totalUsers,
                revenueChange,
                ordersChange: ((totalOrders - lastMonthOrders) / (lastMonthOrders || 1) * 100).toFixed(1),
                newProducts,
                newUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get recent orders
router.get('/orders