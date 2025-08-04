const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateTestReport() {
  console.log('🧪 Generating comprehensive test report...\n');
  
  try {
    // Create directories
    const reportDir = './test-report';
    const coverageDir = './coverage';
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Run tests with full reporting
    console.log('Running tests with coverage...');
    execSync('npm run test:full-report', { stdio: 'inherit' });
    
    // Generate summary report
    const summaryPath = path.join(reportDir, 'summary.json');
    const coverageJsonPath = path.join(coverageDir, 'coverage-summary.json');
    
    if (fs.existsSync(coverageJsonPath)) {
      const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
      const summary = {
        timestamp: new Date().toISOString(),
        coverage: coverageData.total,
        reportFiles: {
          html: './test-report/test-report.html',
          coverage: './coverage/lcov-report/index.html',
          junit: './test-report/junit.xml'
        }
      };
      
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log('\n✅ Test report generated successfully!');
      console.log(`📊 HTML Report: file://${path.resolve('./test-report/test-report.html')}`);
      console.log(`📈 Coverage Report: file://${path.resolve('./coverage/lcov-report/index.html')}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating test report:', error.message);
    process.exit(1);
  }
}

generateTestReport();
