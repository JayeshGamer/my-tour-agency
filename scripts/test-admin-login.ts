import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAdminLogin() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🔐 Testing admin login...\n');
    
    // Step 1: Login as admin
    const loginResponse = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@travelagency.com',
        password: 'admin123',
      }),
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Login failed:', loginResponse.status, error);
      return;
    }
    
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful');
    console.log('🍪 Cookie:', setCookieHeader?.substring(0, 50) + '...');
    
    // Step 2: Check session
    const sessionResponse = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        'Cookie': setCookieHeader || '',
      },
    });
    
    if (!sessionResponse.ok) {
      console.error('❌ Session check failed:', sessionResponse.status);
      return;
    }
    
    const session = await sessionResponse.json();
    console.log('\n📋 Session data:');
    console.log(JSON.stringify(session, null, 2));
    
    // Step 3: Try to access admin dashboard
    const adminResponse = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: {
        'Cookie': setCookieHeader || '',
      },
      redirect: 'manual',
    });
    
    console.log('\n🚪 Admin dashboard access:');
    console.log('Status:', adminResponse.status);
    console.log('Location:', adminResponse.headers.get('location'));
    
    if (adminResponse.status === 200) {
      console.log('✅ Admin dashboard accessible!');
    } else if (adminResponse.status === 302 || adminResponse.status === 307) {
      console.log('❌ Redirected away from admin dashboard');
    } else {
      console.log('❌ Unexpected status code');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testAdminLogin();
