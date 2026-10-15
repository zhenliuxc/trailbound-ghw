const test=require('node:test'),assert=require('node:assert/strict'),{harness}=require('./dom-harness.cjs');
test('postcard text and controls remain outside the image and long archival captions are absent',()=>{
 const h=harness();h.click('route-wugong');h.click('overlay-action');h.toPhoto();const visual=h.$('photo-visual');
 assert.equal(h.$('checkpoint-photo').parentNode,visual);assert.equal(visual.querySelector('h2'),null);assert.equal(visual.querySelector('button'),null);assert.equal(visual.querySelector('aside'),null);assert.equal(h.$('photo-caption'),undefined);
 for(const id of ['photo-title','photo-credit','photo-nature','photo-continue']){let ancestor=h.$(id);while(ancestor){assert.notEqual(ancestor,visual);ancestor=ancestor.parentNode;}}
 assert.ok(h.$('photo-credit').children.some(n=>n.attributes.href?.includes('commons.wikimedia.org')));assert.equal(h.$('photo-title').textContent,'山脊草甸');h.click('photo-continue');assert.equal(h.pendingFrames(),1);
 assert.ok(h.$('route-cards').children.every(card=>!card.children.some(node=>node.textContent.includes('两次选择'))));
});
test('individual journal badges expand only the selected memory and work after legacy migration',()=>{
 const s={getItem:()=>JSON.stringify({version:1,found:['meadow-bird','gorge-goat','snow-light']}),setItem(){}};const h=harness(s),cards=h.$('journal-list').children,first=cards[0].querySelector('button'),second=cards[1].querySelector('button');
 assert.equal(cards.length,3);assert.equal(h.$('journal-page').hidden,true);assert.ok(cards.every(card=>card.querySelector('svg')===null));
 first.emit('click');assert.equal(first.attributes['aria-expanded'],'true');assert.equal(h.$('journal-page').attributes['data-moment'],cards[0].attributes['data-moment']);assert.match(h.$('journal-page').children[0].textContent,/太白山/);
 second.emit('click');assert.equal(first.attributes['aria-expanded'],'false');assert.equal(second.attributes['aria-expanded'],'true');assert.equal(h.$('journal-page').attributes['data-moment'],cards[1].attributes['data-moment']);assert.match(h.$('journal-page').children[0].textContent,/虎跳峡/);
 second.emit('click');assert.equal(h.$('journal-page').hidden,true);assert.equal(second.attributes['aria-expanded'],'false');
});
