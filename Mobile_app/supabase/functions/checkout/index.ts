import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log("Stitch Order Processing System Invoked")

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase vault secrets (STRIPE/SUPABASE) are not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    const { cart, userId, studentName, userEmail, studentId } = body

    if (!userId || !cart || Object.keys(cart).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order details missing (Items or User ID)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 1. Prepare Stripe Line Items
    const line_items = Object.values(cart).map((item: any) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.food.name,
          description: `${item.food.calories} kcal | P:${item.food.protein}g`,
        },
        unit_amount: (item.food.price || 50) * 100,
      },
      quantity: item.quantity,
    }))

    const totalAmount = Object.values(cart).reduce((sum: number, item: any) => sum + (item.food.price || 50) * item.quantity, 0)

    // 2. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success`,
      cancel_url: `${req.headers.get('origin')}/payment`,
      metadata: { userId, orderTotal: totalAmount.toString() },
    })

    // 3. Record "Pending" Order in Supabase
    // Modern table for the App
    const { error: dbError } = await supabase
      .from('food_orders')
      .insert({
        user_id: userId,
        student_name: studentName || 'Student',
        items: cart,
        total_amount: totalAmount,
        status: 'pending',
        stripe_session_id: session.id
      })

    // User-specified legacy table (orders)
    let bigintUserId = null;
    try {
      if (userEmail) {
        const { data: uData } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', userEmail)
          .maybeSingle();
        
        if (uData) {
          bigintUserId = uData.user_id;
        } else {
          // Auto-migrate user to public.users if not exists
          const { data: nUser } = await supabase
            .from('users')
            .insert({ 
              name: studentName, 
              email: userEmail, 
              role: 'student',
              created_at: new Date().toISOString()
            })
            .select('user_id')
            .maybeSingle();
          if (nUser) bigintUserId = nUser.user_id;
        }
      }
    } catch (e) {
      console.error("User mapping failed:", e);
    }

    const foodItemsText = Object.values(cart)
      .map((item: any) => `${item.food.name} x${item.quantity}`)
      .join(', ');

    const { error: legacyError } = await supabase
      .from('orders')
      .insert({
        user_id: bigintUserId,
        total_amount: totalAmount,
        order_time: new Date().toISOString(),
        status: 'pending',
        student_id: studentId || userId.substring(0, 8),
        food_items: foodItemsText
      });

    if (dbError || legacyError) {
      console.error('Database logging failed:', dbError?.message || legacyError?.message)
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Order logic error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
