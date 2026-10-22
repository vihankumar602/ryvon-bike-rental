const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', '..', 'assets', 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Update api.request to wrap fetch in try-catch for clear network error messages
const oldApiFetch = `      const res = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
        ...options,
        headers
      });`;

const newApiFetch = `      let res;
      try {
        res = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
          ...options,
          headers
        });
      } catch (networkErr) {
        throw new Error(\`Unable to connect to RYVON backend server at \${API_BASE_URL}. Please ensure the backend server is running (e.g. 'npm start' on port 3000).\`);
      }`;

if (!code.includes(oldApiFetch)) {
  console.error('Target oldApiFetch not found!');
  process.exit(1);
}
code = code.replace(oldApiFetch, newApiFetch);
console.log('1. Updated api.request with network error handling.');

// 2. Remove Forgot Password link, OR CONTINUE WITH divider, and Google/Apple social login grid from template
const oldAuthTemplate = `            \` : \`
              <div class="auth-options-row">
                <label class="remember-check">
                  <input type="checkbox" id="auth-remember" checked>
                  <span>Remember me</span>
                </label>
                <a href="#" class="forgot-gold-link">Forgot password?</a>
              </div>
            \`}

            <button class="btn btn-gold-solid btn-full" id="auth-submit-btn" type="submit">
              \${isLogin ? 'Sign In to Dashboard →' : 'Register Rider Profile →'}
            </button>
          </form>

          <div class="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div class="social-login-grid">
            <button class="social-login-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#ea4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/><path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#fbbc05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"/><path fill="#34a853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/></svg>
              <span>Google</span>
            </button>
            <button class="social-login-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.98 1.07.08 2.16-.57 2.81-1.38z"/></svg>
              <span>Apple ID</span>
            </button>
          </div>

          <div class="auth-switch-footer">`;

const newAuthTemplate = `            \` : \`
              <div class="auth-options-row">
                <label class="remember-check">
                  <input type="checkbox" id="auth-remember" checked>
                  <span>Remember me</span>
                </label>
              </div>
            \`}

            <button class="btn btn-gold-solid btn-full" id="auth-submit-btn" type="submit">
              \${isLogin ? 'Sign In to Dashboard →' : 'Register Rider Profile →'}
            </button>
          </form>

          <div class="auth-switch-footer">`;

if (!code.includes(oldAuthTemplate)) {
  console.error('Target oldAuthTemplate not found in normalized code!');
  process.exit(1);
}
code = code.replace(oldAuthTemplate, newAuthTemplate);
console.log('2. Removed social login grid, divider, and dead forgot password link from auth template.');

// 3. Remove Google & Apple JavaScript handlers (from isValidGoogleEmail to end of social button listeners)
const startMarker = '    function isValidGoogleEmail(email) {';
const endMarker = '    // Interactive Auth Features (Eye Toggle, Strength Meter, Confirm Password Match)';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
  console.error('Markers for Google/Apple JS handlers not found or inverted:', { startIndex, endIndex });
  process.exit(1);
}

code = code.slice(0, startIndex) + code.slice(endIndex);
console.log('3. Removed Google & Apple JS handlers, modals, popup listener, and social button click handlers.');

// 4. Update authUrlError handling to avoid calling deleted displayAuthError
const oldUrlError = `    const authUrlError = query.get('error');
    if (authUrlError) {
      displayAuthError(authUrlError);
    }`;

const newUrlError = `    const authUrlError = query.get('error');
    if (authUrlError && typeof toast === 'function') {
      toast(authUrlError);
    }`;

if (!code.includes(oldUrlError)) {
  console.error('Target oldUrlError not found!');
  process.exit(1);
}
code = code.replace(oldUrlError, newUrlError);
console.log('4. Updated authUrlError handling.');

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('Successfully updated assets/js/app.js!');
