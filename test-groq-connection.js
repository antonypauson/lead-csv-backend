#!/usr/bin/env node

/**
 * Simple script to test Groq API connection
 * Run with: node test-groq-connection.js
 */

require('dotenv').config();

async function testGroqConnection() {
  console.log('🔍 Testing Groq API Connection...\n');

  // Check if API key exists
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    console.log('💡 Make sure you have GROQ_API_KEY in your .env file');
    return;
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

  try {
    // Import and test the service
    const { getAiLeadScore } = require('./src/services/aiScoring.service');

    const testLead = {
      name: "Test User",
      role: "CEO",
      company: "Test Company",
      industry: "Software",
      location: "San Francisco",
      linkedin_bio: "CEO of a software company looking to improve sales processes"
    };

    const testOffer = {
      name: "AI Sales Tool",
      value_props: ["Automate outreach", "Improve conversions"],
      ideal_use_cases: ["B2B SaaS", "Sales teams"]
    };

    const testRuleScore = {
      breakdown: {
        role: { category: 'decision_maker', reasoning: 'CEO role' },
        industry: { match_type: 'exact', reasoning: 'Software matches' },
        completeness: { percentage: 100 }
      }
    };

    console.log('📤 Making API call to Groq...');
    const startTime = Date.now();

    const result = await getAiLeadScore(testLead, testOffer, testRuleScore);

    const duration = Date.now() - startTime;

    console.log('\n✅ SUCCESS! Groq API is working');
    console.log('📊 Results:');
    console.log(`   AI Score: ${result.aiScore}/50`);
    console.log(`   AI Intent: ${result.aiIntent}`);
    console.log(`   AI Reasoning: ${result.aiReasoning}`);
    console.log(`   Response Time: ${duration}ms`);
    console.log('\n📝 Logs:');
    result.logs.forEach(log => console.log(`   ${log}`));

  } catch (error) {
    console.error('\n❌ ERROR: Groq API call failed');
    console.error('Error details:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 This looks like an authentication error. Check:');
      console.log('   1. Your API key is correct');
      console.log('   2. Your Groq account is active');
      console.log('   3. Your API key has the right permissions');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate limit exceeded. Try again in a few minutes.');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network error. Check your internet connection.');
    } else {
      console.log('\n💡 Unexpected error. Full error:');
      console.error(error);
    }
  }
}

// Run the test
testGroqConnection().catch(console.error);