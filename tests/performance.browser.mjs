import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from "node:path";
import { createRequire } from "node:module";
const {chromium} = createRequire(path.resolve(process.env.PERF_TOOLS_DIR || ".", "package.json"))("playwright");
const [base='http://localhost:3100',label='final-browser']=process.argv.slice(2);
const directory=path.resolve(process.env.PERF_ARTIFACTS_DIR || '.performance-reports',label);
await fs.mkdir(directory,{recursive:true});
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),headless:true,args:['--disable-extensions']});
const results=[],routeFailures=[];
for(const width of [360,390,412,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<1024,hasTouch:width<1024,deviceScaleFactor:width<768?3:1,locale:'vi-VN',timezoneId:'Asia/Bangkok'});
  // Staging's CORS allowlist excludes localhost. Forward real public GET data for functional tests only.
  if(new URL(base).hostname==='localhost') await context.route('https://test-api-ktcn.itup.io.vn/api/v1/portal/**',async route=>{
    assert.equal(route.request().method(),'GET','Functional checks must not write to the API');
    const response=await route.fetch();
    await route.fulfill({response,headers:{...response.headers(),'access-control-allow-origin':new URL(base).origin,'access-control-allow-credentials':'true'}});
  });
  const page=await context.newPage();const errors=[],warnings=[],api=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))warnings.push(message.text());});
  page.on('response',response=>{if(response.url().includes('test-api-ktcn'))api.push({url:response.url(),status:response.status()});});
  const response=await page.goto(`${base}/vi`,{waitUntil:'load',timeout:60000});
  const html=await response.text();
  assert.equal(response.status(),200);
  assert(html.includes('<!--email_off-->vienktcn@vinhuni.edu.vn<!--/email_off-->'));
  assert(!html.includes('href="/images/logo.svg"'));
  assert(html.includes('THÔNG BÁO'),'Notices must be server rendered');
  await page.locator('canvas').waitFor({state:'attached',timeout:5000});
  assert(await page.locator('canvas').evaluate(c=>c.width>0&&c.height>0),'First-visit fireworks must still run');
  await page.waitForTimeout(7500);
  const geometry=await page.evaluate(()=>({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,viewport:document.querySelector('meta[name="viewport"]').content,header:document.querySelector('header').getBoundingClientRect().toJSON(),hero:document.querySelector('section[aria-label="Thông tin nổi bật"]').getBoundingClientRect().toJSON(),logos:[...document.images].filter(i=>i.alt.startsWith('Trường Kỹ thuật')).map(i=>({src:i.currentSrc,rect:i.getBoundingClientRect().toJSON()})),analyticsLoaded:[...document.scripts].filter(s=>s.src.includes('googletagmanager.com/gtag/js')).length,analyticsConfigured:(window.dataLayer||[]).some(e=>e[0]==='config'&&e[1]==='G-YNL3YLDM52'),text:document.body.innerText}));
  assert.equal(geometry.scrollWidth,geometry.clientWidth,'No horizontal viewport overflow');
  assert.equal(geometry.header.height,73);
  assert(Math.abs(geometry.hero.width/geometry.hero.height-(width<768?16/9:2.39))<0.02,'Hero aspect ratio must be preserved');
  assert.equal(geometry.analyticsLoaded,1,'GA script must still load exactly once');
  assert(geometry.analyticsConfigured,'GA page view must still be queued');
  await page.screenshot({path:`${directory}/${width}.png`});
  if(width<1024){
    const toggle=page.getByRole('button',{name:'Toggle Navigation Menu'});
    await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await page.locator('#mobile-navigation').isVisible());
    await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  }
  if(width===390){
    const bell=page.locator('button[aria-controls="client-notification-panel"]');await bell.click();assert(await page.locator('#client-notification-panel').isVisible());await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Thạc sĩ',exact:true}).click();await page.waitForTimeout(1500);
    await page.getByRole('button',{name:'Đại học chính quy',exact:true}).click();
    await page.getByRole('button',{name:/Tiếng Việt/}).click();await page.getByRole('button',{name:/English/}).click();
    await page.waitForURL('**/en');await page.waitForTimeout(2000);assert.equal(await page.locator('html').getAttribute('lang'),'en');
    for(const route of ['/vi/tim-kiem','/vi/gioi-thieu','/vi/dao-tao','/vi/tu-van-tuyen-sinh']){
      const routePage=await context.newPage();
      routePage.on('pageerror',error=>errors.push(error.message));
      try {
        const routeResponse=await routePage.goto(base+route,{waitUntil:'load',timeout:30000});
        assert.equal(routeResponse.status(),200,route);
        await routePage.waitForTimeout(1000);
        if(route==='/vi/tu-van-tuyen-sinh'){
          await routePage.getByRole('button',{name:'Gửi yêu cầu',exact:true}).click();
          await routePage.waitForTimeout(300);
          assert(await routePage.locator('form [aria-invalid="true"]').count()>=3,'Empty consultation form must show validation errors');
        }
      } catch(error){routeFailures.push({route,error:error.message});}
      finally {await routePage.close();}
    }
  }
  assert.deepEqual(errors,[],`No browser exceptions at ${width}px`);
  assert(api.length>=2,'Notification and statistics API requests must be observed');
  assert(api.every(r=>r.status===200),'Public API calls must succeed');
  results.push({width,status:response.status(),geometry,errors,warnings,api});
  await fs.writeFile(`${directory}/results.json`,JSON.stringify({results,routeFailures},null,2));
  console.log(JSON.stringify({width,viewport:{width:geometry.clientWidth,scrollWidth:geometry.scrollWidth},exceptions:errors.length,apiRequests:api.length,warnings}));
  await context.close();
}
await browser.close();
console.log(JSON.stringify({routeFailures}));
if(routeFailures.length)process.exitCode=1;
