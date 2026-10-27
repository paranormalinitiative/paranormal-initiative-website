#!/usr/bin/env node
// TPI-STUDIOFLOW-091: isolated Firefox Developer Edition and synthetic capture.
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Builder, By } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';

const base = process.env.TPI_091_BASE_URL || 'http://127.0.0.1:5175';
const profile = join(mkdtempSync(join(tmpdir(), 'tpi-091-')), 'profile');
mkdirSync(profile, { recursive: true });
const opts = new firefox.Options().setBinary(process.env.TPI_FIREFOX_BINARY || '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox').setProfile(profile).addArguments('-headless', '-no-remote', '-new-instance')
  .setPreference('media.navigator.streams.fake', true).setPreference('media.navigator.audio.fake', true)
  .setPreference('media.navigator.permission.disabled', true).setPreference('media.autoplay.default', 0);
const driver = await new Builder().forBrowser('firefox').setFirefoxOptions(opts).setFirefoxService(new firefox.ServiceBuilder(process.env.TPI_GECKODRIVER || '/opt/homebrew/bin/geckodriver')).build();
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, passed: Boolean(ok), detail: ok ? '' : String(detail) });
const js = (script, ...args) => driver.executeScript(script, ...args);
async function wait(description, predicate, ms = 30000) {
  const until = Date.now() + ms;
  while (Date.now() < until) { try { const value = await predicate(); if (value) return value; } catch {} await new Promise(r => setTimeout(r, 200)); }
  throw new Error(`${description} timed out`);
}
async function button(label) {
  return js("var b=Array.from(document.querySelectorAll('button')).find(x=>x.textContent.trim()===arguments[0]); if(!b)return false;b.click();return true;", label);
}
try {
  await driver.manage().setTimeouts({ pageLoad: 30000, script: 30000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  await driver.get(base + '/');
  await wait('home', async () => (await driver.findElements(By.xpath("//button[contains(., 'Record without going live')]"))).length);
  await driver.findElement(By.xpath("//button[contains(., 'Record without going live')]")).click();
  await wait('recording modal', async () => await button('Continue to setup'));
  await wait('setup', async () => (await driver.findElements(By.css('.setup-page .setup-form'))).length);
  await wait('microphone capture', async () => js("var v=document.querySelector('.setup-page video');return !!(v&&v.srcObject&&v.srcObject.getAudioTracks().length&&v.srcObject.getVideoTracks().length)"));
  const initial = await js("var s=document.querySelector('.setup-page'); var v=s.querySelector('video'); return {fx:s.querySelectorAll('.voice-fx-panel').length, text:s.innerText, audio:v.srcObject.getAudioTracks()[0].readyState,video:v.srcObject.getVideoTracks()[0].readyState, selects:Array.from(s.querySelectorAll('.device-strip select')).map(x=>x.getAttribute('aria-label'))}");
  check('setup has no Voice FX interface', initial.fx === 0 && !/Voice FX could not start/.test(initial.text));
  check('camera and microphone capture are live', initial.audio === 'live' && initial.video === 'live', JSON.stringify(initial));
  check('camera microphone and speaker selectors remain', ['Camera','Microphone','Speaker'].every(x => initial.selects.includes(x)), JSON.stringify(initial.selects));
  const meter = await wait('audio meter responds to synthetic microphone', async () => js("return parseInt(document.querySelector('.setup-form .meter').style.getPropertyValue('--level'),10)||0"), 20000).catch(() => 0);
  check('microphone meter responds to synthetic audio', meter > 0, meter);
  check('microphone level control exists', (await driver.findElements(By.css('.setup-mic-level input[type=range]'))).length === 1);
  const cameraBefore = await js("return document.querySelector('select[aria-label=Camera]').value");
  const microphoneBefore = await js("return document.querySelector('select[aria-label=Microphone]').value");
  const labels = await driver.findElements(By.css('.setup-form label input:not([type=range])'));
  await labels[0].clear(); await labels[0].sendKeys('QA setup host');
  await labels[1].clear(); await labels[1].sendKeys('QA headline');
  await button('Enter studio');
  await wait('studio environment', async () => (await driver.findElements(By.css('.right-rail'))).length);
  const profileData = await js("return JSON.parse(localStorage.getItem('studioflow.profile')||'{}')");
  check('display name and headline persist on entry', profileData.displayName === 'QA setup host' && profileData.headline === 'QA headline', JSON.stringify(profileData));
  const currentTracks = await js("var v=Array.from(document.querySelectorAll('video')).find(x=>x.srcObject&&x.srcObject.getAudioTracks().length);if(!v)return null;return {audio:v.srcObject.getAudioTracks()[0].getSettings().deviceId,video:v.srcObject.getVideoTracks()[0]?.getSettings().deviceId}");
  check('selected capture devices remain active on entry', Boolean(currentTracks) && currentTracks.audio === microphoneBefore && currentTracks.video === cameraBefore, JSON.stringify(currentTracks));
  await wait('Voice FX navigation', async () => (await driver.findElements(By.css('[data-studio-panel-tab="Voice FX"]'))).length);
  await driver.findElement(By.css('[data-studio-panel-tab="Voice FX"]')).click();
  await wait('in-Studio Voice FX panel', async () => (await driver.findElements(By.css('.voice-fx-panel'))).length);
  check('Voice FX remains available inside Studio', (await driver.findElements(By.css('.voice-fx-panel'))).length > 0);
  const fxReady = await wait('Voice FX processor becomes ready', async () => js("return document.querySelector('.voice-fx-status.ready')?.textContent || ''"), 25000).catch(() => '');
  check('in-Studio Voice FX initializes with synthetic microphone', Boolean(fxReady), fxReady);
} catch (error) { check('suite completed', false, error.message); }
finally { await driver.quit(); }
console.log(JSON.stringify({ suite:'TPI-STUDIOFLOW-091-VIDEO-SETUP', base, checks, passed:checks.filter(x=>x.passed).length, failed:checks.filter(x=>!x.passed).length }, null, 2));
process.exitCode = checks.some(x=>!x.passed) ? 1 : 0;
