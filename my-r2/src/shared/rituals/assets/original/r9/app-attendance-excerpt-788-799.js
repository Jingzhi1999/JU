
    const makeLayer=(p,isNext=false)=>{
    const el=document.createElement('div');el.className='attendance-paper '+(isNext?'is-next':'is-current');el.dataset.personKey=H.attendanceKey(p);el.innerHTML=ticketMarkup('ticket-stage');
    if(isNext){el.setAttribute('aria-hidden','true');el.inert=true;}
    $('.attendance-desk').append(el);
    const layer={el,person:p,ticket:null,ready:false};ctx.layers.push(layer);
    const event={...H.projection(E()),participantName:p.name,participantId:p.participantId,ticketId:p.ticketId,emailDomain:p.emailDomain,emailVerified:p.emailVerified,verified:p.verified,stampAnchor:{invite:{x:.78,y:.62,r:.11},riso:{x:.79,y:.73,r:.12}}[E().pack]};
    layer.ticket=JuTicketsHost.mount($('[data-t08-scope]',el),{profile:'quick',event,mode:'pending',history:()=>[],paintTicket:attendanceArt,stampAnchor:e=>e.stampAnchor||({invite:{x:.78,y:.62,r:.11},street:{x:.78,y:.17,r:.13},grain:{x:.72,y:.38,r:.15},mono:{x:.76,y:.18,r:.12},riso:{x:.79,y:.73,r:.12},acid:{x:.77,y:.17,r:.12}})[e.pack],active:()=>valid()&&!modal,onComplete:()=>{if(valid()&&ctx.current===layer)ctx.stampComplete(layer)}});
    layer.ticket.setSettled(recordFor(p)?.status||'pending');
    $$('canvas,[data-t08="stage"],img',el).forEach(n=>n.tabIndex=-1);
    const ready=()=>{if(!valid())return;if(layer.ticket.diag().ready){layer.ready=true;layer.ticket.render();if(ctx.current===layer&&ctx.phase==='preparing'){setPhase('ready');lock(false)}}else later(ready,16)};later(ready,0);
    return layer;
