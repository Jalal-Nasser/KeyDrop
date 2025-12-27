import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, items, paypalOrderId } = body;

        // 1. Validation
        if (!email || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Invalid request: Missing email or items' }, { status: 400 });
        }

        // 2. Find/Create User
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || 'Guest Customer',
                    role: 'customer',
                    displayId: `CUST-${Math.floor(100000 + Math.random() * 900000)}` // Simple ID generation
                }
            });
        }

        // 3. Calculate Total & Verify Stock
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
            }

            // Optional: Check stock
            // if (product.stock < item.quantity) ...

            const price = Number(product.sale_price || product.price);
            const lineTotal = price * item.quantity;
            totalAmount += lineTotal;

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: price // Snapshot the price at time of purchase
            });
        }

        // 4. Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                customerEmail: email, // Store explicitly for guest lookup
                status: 'paid', // Assuming frontend only calls this after payment or if authorized
                total: totalAmount,
                paypalOrderId: paypalOrderId || null,
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: { include: { product: true } }
            }
        });

        // 5. Send Confirmation Email
        // We use the existing status email for "PAID" which acts as confirmation
        sendOrderStatusEmail(email, order.id, 'paid')
            .catch(err => console.error('Failed to send confirmation email:', err));

        return NextResponse.json({
            success: true,
            orderId: order.id,
            displayId: order.id.slice(-8).toUpperCase()
        });

    } catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
