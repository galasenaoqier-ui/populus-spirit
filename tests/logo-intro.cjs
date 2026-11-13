/** Run with NODE_PATH pointing to Playwright, and SITE_URL pointing to a local HTTP server. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const base=process.env.SITE_URL||'http://127.0.0.1:8767';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const out=path.resolve(__dirname,'../设计/logo-motion/outputs/site-integration');fs.mkdirSync(out,{recursive:true});
 await page.goto(base+'/code_artifact.html',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('#site-intro').count(),1,'Site must include the logo welcome dialog');
 await page.waitForFunction(()=>document.querySelector('#site-intro')?.open);
 const frame=page.frameLocator('#site-intro iframe');await frame.locator('html.is-ready').waitFor();
 assert.equal(await frame.locator('#brand-message').textContent(),'三千年的等候只为等候你的到来');
 await frame.locator('#logo-root').evaluate(el=>{for(const a of el.getAnimations({subtree:true})){a.pause();a.currentTime=2800;}});
 await page.screenshot({path:path.join(out,'desktop_intro.png')});await frame.locator('#logo-root').evaluate(el=>{for(const a of el.getAnimations({subtree:true}))a.play();});
 await page.waitForFunction(()=>!document.querySelector('#site-intro')?.open,{},{timeout:6000});
 assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('intro-open')),false);
 assert(await page.locator('.hero-title').isVisible());
 await page.screenshot({path:path.join(out,'desktop_exhibit.png')});
 await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('#site-intro').evaluate(el=>el.open),false,'Second visit in same tab skips intro');
 // Explicitly replay via the exhibit footer, without resetting site state.
 await page.locator('#replayIntro').click();await page.waitForFunction(()=>document.querySelector('#site-intro').open);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#site-intro').open);
 assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('intro-open')),false);
 await page.locator('#replayIntro').click();await page.locator('#skipIntro').click();await page.waitForFunction(()=>!document.querySelector('#site-intro').open);
 assert.equal(await page.locator('#site-intro iframe').count(),0,'Closing must release the frame');
 // Existing exhibition controls remain usable after the modal is dismissed.
 await page.locator('.leaf-tab').nth(1).click();assert(await page.locator('.leaf-tab').nth(1).evaluate(el=>el.classList.contains('active')));
 assert.equal(await page.locator('#backgroundMusic').evaluate(el=>el.paused),true,'No automatic audio');
 // Small phones and landscape must fit the whole logo and welcome text.
 for(const viewport of [{width:390,height:844},{width:667,height:375},{width:320,height:568}]){
  const mobile=await context.newPage();await mobile.setViewportSize(viewport);await mobile.goto(base+'/code_artifact.html',{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>document.querySelector('#site-intro').open);
  const f=mobile.frameLocator('#site-intro iframe');await f.locator('html.is-ready').waitFor();
  const bounds=await f.locator('#logo-root').boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width+1&&bounds.y+bounds.height<=viewport.height+1,'Logo and text must fit viewport');
  await f.locator('#logo-root').evaluate(el=>{for(const a of el.getAnimations({subtree:true})){a.pause();a.currentTime=2800;}});
  await mobile.screenshot({path:path.join(out,`intro_${viewport.width}x${viewport.height}.png`)});
  await mobile.locator('#skipIntro').click();await mobile.waitForFunction(()=>!document.querySelector('#site-intro').open);await mobile.close();
 }
 const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(base+'/code_artifact.html',{waitUntil:'domcontentloaded'});assert.equal(await rp.locator('#site-intro').evaluate(el=>el.open),false,'Reduced motion bypasses intro');await reduced.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(base+'/code_artifact.html',{waitUntil:'domcontentloaded'});assert(await np.locator('.hero-title').isVisible());assert.equal(await np.locator('#site-intro').evaluate(el=>el.open),false);await nojs.close();
 const blocked=await browser.newContext();const bp=await blocked.newPage();await bp.route('**/logo-intro/index.html',r=>r.abort());await bp.goto(base+'/code_artifact.html',{waitUntil:'domcontentloaded'});await bp.waitForFunction(()=>!document.querySelector('#site-intro').open,{},{timeout:11000});assert(await bp.locator('.hero-title').isVisible());await blocked.close();
 await page.goto(base+'/index.html#story',{waitUntil:'domcontentloaded'});await page.waitForURL('**/code_artifact.html#story');assert.equal(await page.locator('#site-intro').evaluate(el=>el.open),false,'Deep links go directly to content');
 const report={passed:true,checks:['first visit','auto dismiss','same-tab skip','replay','Escape','skip button','frame cleanup','existing leaf tabs','no automatic audio','mobile 390','landscape','mobile 320','reduced motion','no JavaScript','failed frame fallback','entry redirect/deep link'],pageErrors:errors};
 assert.equal(errors.length,0);fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
