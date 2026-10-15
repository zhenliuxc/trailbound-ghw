const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./dom-harness.cjs');
test('postcard text and controls remain outside the image and long archival captions are absent',()=>{
 const h=harness();h.click('route-wugong');h.click('overlay-action');h.toPhoto();const visual=h.$('photo-visual');
 assert.equal(h.$('checkpoint-photo').parentNode,visual);assert.equal(visual.querySelector('h2'),null);assert.equal(visual.querySelector('button'),null);assert.equal(visual.querySelector('aside'),null);assert.equal(h.$('photo-caption'),undefined);
 for(const id of ['photo-title','photo-credit','photo-nature','photo-continue']){let ancestor=h.$(id);while(ancestor){assert.notEqual(ancestor,visual);ancestor=ancestor.parentNode;}}
 assert.ok(h.$('photo-credit').children.some(n=>n.attributes.href?.includes('commons.wikimedia.org')));assert.equal(h.$('photo-title').textContent,'山脊草甸');h.click('photo-continue');assert.equal(h.pendingFrames(),1);
 assert.ok(h.$('route-cards').children.every(card=>!card.children.some(node=>node.textContent.includes('两次选择'))));
});
test('journal artwork and text are inline while legacy cleanup awaits explicit confirmation',()=>{
 const s={getItem:()=>JSON.stringify({version:1,found:['meadow-bird','gorge-goat','snow-light']}),setItem(){throw Error('must not write without confirmation');}};const h=harness(s),cards=h.$('journal-list').children;
 assert.equal(cards.length,3);assert.equal(h.$('journal-page'),undefined);assert.equal(h.$('journal-reset-notice').hidden,false);
 for(const card of cards){assert.equal(card.querySelector('svg'),null);assert.ok(card.querySelector('span').style.backgroundImage);assert.ok(card.querySelector('h3'));assert.ok(card.querySelector('article').children[1].children.some(c=>c.textContent.includes('这是以前')));}
});
