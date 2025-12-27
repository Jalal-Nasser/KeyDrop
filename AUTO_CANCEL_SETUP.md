# Auto-Cancel Orders Setup Guide

This guide explains how to set up automatic cancellation of pending orders that haven't been paid within 10 minutes.

## Overview

The auto-cancel system includes:
- **API Endpoint**: `/api/admin/auto-cancel-orders` - Cancels pending orders older than 10 minutes
- **Cron Endpoint**: `/api/cron/auto-cancel-orders` - External cron job trigger
- **Admin Page**: `/admin/auto-cancel` - Manual trigger for testing
- **Email Notifications**: Customers receive auto-cancellation emails
- **Discord Notifications**: Admin receives notifications about auto-cancelled orders
- **Payment Timer**: Real-time countdown showing time remaining to complete payment

## Configuration

### Timeout Period
Orders are automatically cancelled after **10 minutes** of being in "pending" status. To change this:

1. Edit `src/app/api/admin/auto-cancel-orders/route.ts`
2. Modify the `AUTO_CANCEL_TIMEOUT_MINUTES` constant

### Environment Variables
Make sure these are set in your environment:

```bash
# Required for email notifications
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Required for Discord notifications
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Optional: For cron job security
CRON_SECRET_TOKEN=your_secret_token
```

## Setting Up Automated Execution

### Option 1: Vercel Cron (Recommended)
If you're using Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-cancel-orders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes. Adjust the schedule as needed.

### Option 2: GitHub Actions
Create `.github/workflows/auto-cancel-orders.yml`:

```yaml
name: Auto-Cancel Orders
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  auto-cancel:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Cancel
        run: |
          curl -X POST "${{ secrets.BASE_URL }}/api/cron/auto-cancel-orders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}"
```

### Option 3: External Cron Service
Use services like:
- **cron-job.org**
- **EasyCron**
- **SetCronJob**

Set up a job to call: `https://yourdomain.com/api/cron/auto-cancel-orders`

### Option 4: Server Cron Job
If you have server access, add to crontab:

```bash
# Run every 5 minutes
*/5 * * * * curl -X POST "https://yourdomain.com/api/cron/auto-cancel-orders" -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

## Testing

### Manual Testing
1. Go to `/admin/auto-cancel` in your admin panel
2. Click "Auto-Cancel Pending Orders"
3. Check the results and logs

### Test with Old Orders
1. Create a test order
2. Manually update its `created_at` timestamp in the database to be older than 10 minutes
3. Run the auto-cancel process
4. Verify the order status changes to "cancelled"

## Monitoring

### Check Logs
Monitor your application logs for:
- Auto-cancel process execution
- Email notification success/failure
- Discord notification success/failure

### Database Queries
Check for cancelled orders:

```sql
SELECT id, user_id, total, status, created_at 
FROM orders 
WHERE status = 'cancelled' 
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Customization

### Email Templates
Modify `src/components/emails/order-status-changed-template.tsx` to customize auto-cancellation emails.

### Discord Notifications
Update `supabase/functions/discord-order-notification/index.ts` to customize Discord messages.

### Timeout Logic
The timeout logic is in `src/app/api/admin/auto-cancel-orders/route.ts`. You can:
- Change the timeout period
- Add different timeouts for different order types
- Add additional conditions for cancellation

## Troubleshooting

### Common Issues

1. **Orders not being cancelled**
   - Check if the cron job is running
   - Verify the timeout period
   - Check database connection

2. **Email notifications not sent**
   - Verify email service configuration
   - Check email service logs
   - Ensure user emails are valid

3. **Discord notifications not sent**
   - Verify `DISCORD_WEBHOOK_URL` is set
   - Check Discord webhook URL is valid
   - Monitor Discord function logs

### Debug Mode
Add logging to track the process:

```typescript
console.log(`Found ${pendingOrders.length} orders to auto-cancel`)
console.log(`Order IDs: ${orderIds.join(', ')}`)
```

## Security Considerations

- The cron endpoint is protected with optional token authentication
- Admin endpoints require authentication
- Email notifications are sent only to verified users
- Discord notifications don't expose sensitive information

## Performance

- The process runs efficiently with database indexes on `status` and `created_at`
- Batch processing handles multiple orders at once
- Notifications are sent asynchronously to avoid blocking
