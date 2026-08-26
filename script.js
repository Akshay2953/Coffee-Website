(() => {
  "use strict";

  const menu = [
    {id:"latte",name:"Signature Latte",desc:"Silky espresso, steamed milk & microfoam.",price:240,cat:"coffee",tone:""},
    {id:"capp",name:"Cappuccino",desc:"Rich espresso with a cloud of foam.",price:230,cat:"coffee",tone:""},
    {id:"mocha",name:"Mocha Cloud",desc:"Dark cocoa, espresso and velvety milk.",price:260,cat:"coffee",tone:"pink"},
    {id:"flat",name:"Flat White",desc:"Double espresso, glossy microfoam.",price:250,cat:"coffee",tone:""},
    {id:"cold",name:"Slow Cold Brew",desc:"18-hour steeped, smooth and naturally sweet.",price:250,cat:"cold",tone:"cold"},
    {id:"matcha",name:"Iced Matcha",desc:"Ceremonial matcha, milk and a little magic.",price:270,cat:"noncoffee",tone:"green"},
    {id:"chai",name:"Spiced Chai",desc:"Warming spices, tea and creamy milk.",price:220,cat:"noncoffee",tone:"pink"},
    {id:"cookie",name:"Sea Salt Cookie",desc:"Buttery, chewy and finished with sea salt.",price:150,cat:"bites",tone:""}
  ];

  const state = {
    cart: [],
    category: "all",
    builder: {base:"Signature Latte",price:240,size:"Regular",sizeAdd:0,milk:"Whole Milk",milkAdd:0,sweet:"No extra",extras:[]}
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => `₹${Math.round(n)}`;

  function renderMenu() {
    const grid = $("#menuGrid");
    const items = state.category === "all" ? menu : menu.filter(x => x.cat === state.category);
    grid.innerHTML = items.map(item => `
      <article class="menu-card reveal visible">
        <div class="drink-art ${item.tone}">
          <div class="art-cup"><span>B&B</span></div>
        </div>
        <div class="card-info">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="card-bottom">
            <span class="card-price">${money(item.price)}</span>
            <button class="add-btn" type="button" data-add-id="${item.id}" aria-label="Add ${item.name}">+</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function addItem(item, custom=false) {
    const existing = !custom && state.cart.find(x => x.id === item.id && !x.custom);
    if (existing) existing.qty++;
    else state.cart.push({...item, qty:1});
    renderCart();
    showToast(`${item.name} added to your order`);
  }

  function renderCart() {
    const count = state.cart.reduce((sum,x)=>sum+x.qty,0);
    const total = state.cart.reduce((sum,x)=>sum+x.price*x.qty,0);
    $("#cartCount").textContent = count;
    $("#cartItemsLabel").textContent = `(${count})`;
    $("#cartTotal").textContent = money(total);

    const wrap = $("#cartItems");
    if (!state.cart.length) {
      wrap.innerHTML = `<div class="empty-cart"><span>☕</span><h3>Your cart is empty</h3><p>Add something delicious to get started.</p></div>`;
      return;
    }
    wrap.innerHTML = state.cart.map((item,i)=>`
      <div class="cart-item">
        <div class="cart-thumb">☕</div>
        <div>
          <h4>${item.name}</h4>
          <p>${item.details || "Freshly crafted"}</p>
          <div class="qty">
            <button type="button" data-qty="${i}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <b>${item.qty}</b>
            <button type="button" data-qty="${i}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <strong>${money(item.price*item.qty)}</strong>
      </div>
    `).join("");
  }

  function openCart() {
    $("#cartDrawer").classList.add("open");
    $("#cartDrawer").setAttribute("aria-hidden","false");
    $("#drawerBackdrop").classList.add("show");
    document.body.style.overflow="hidden";
  }
  function closeCart() {
    $("#cartDrawer").classList.remove("open");
    $("#cartDrawer").setAttribute("aria-hidden","true");
    $("#drawerBackdrop").classList.remove("show");
    document.body.style.overflow="";
  }

  function showToast(message) {
    const toast=$("#toast");
    toast.textContent=message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
  }

  function builderPrice() {
    const b=state.builder;
    return b.price+b.sizeAdd+b.milkAdd+b.extras.reduce((s,x)=>s+x.price,0);
  }

  function updateBuilder() {
    const b=state.builder;
    const total=builderPrice();
    $("#previewName").textContent=b.base;
    $("#previewPrice").textContent=money(total);
    const liquid=$("#previewLiquid");
    liquid.style.background = b.base==="Cold Brew" ? "#3a2116" : b.base==="Mocha Cloud" ? "#5a2d18" : "#6d3b23";
  }

  function addCustom(e) {
    e.preventDefault();
    const b=state.builder;
    const details=[b.size,b.milk,b.sweet,...b.extras.map(x=>x.name)].join(" • ");
    addItem({
      id:"custom-"+Date.now(),
      name:b.base,
      price:builderPrice(),
      details,
      custom:true
    },true);
    openCart();
  }

  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add("visible"); });
    }, {threshold:.12});
    $$(".reveal").forEach(el=>observer.observe(el));
  }

  $$(".category-tabs button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $$(".category-tabs button").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      state.category=btn.dataset.category;
      renderMenu();
    });
  });

  $("#menuGrid").addEventListener("click",e=>{
    const btn=e.target.closest("[data-add-id]");
    if(!btn)return;
    const item=menu.find(x=>x.id===btn.dataset.addId);
    if(item)addItem(item);
  });

  $$("#baseChoices .choice").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $$("#baseChoices .choice").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
      state.builder.base=btn.dataset.value;
      state.builder.price=Number(btn.dataset.price)||0;
      updateBuilder();
    });
  });

  $$("#sizeChoices .pill").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $$("#sizeChoices .pill").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
      state.builder.size=btn.dataset.value;
      state.builder.sizeAdd=Number(btn.dataset.add)||0;
      updateBuilder();
    });
  });

  $$("#sweetChoices .pill").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $$("#sweetChoices .pill").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
      state.builder.sweet=btn.dataset.value;
    });
  });

  $("#milk").addEventListener("change",e=>{
    const [name,price]=e.target.value.split("|");
    state.builder.milk=name; state.builder.milkAdd=Number(price)||0; updateBuilder();
  });

  $$(".extra-list input").forEach(input=>{
    input.addEventListener("change",()=>{
      const data={name:input.dataset.name,price:Number(input.dataset.price)||0};
      if(input.checked) state.builder.extras.push(data);
      else state.builder.extras=state.builder.extras.filter(x=>x.name!==data.name);
      updateBuilder();
    });
  });

  $("#builderForm").addEventListener("submit",addCustom);

  $("#cartItems").addEventListener("click",e=>{
    const btn=e.target.closest("[data-qty]");
    if(!btn)return;
    const i=Number(btn.dataset.qty), delta=Number(btn.dataset.delta);
    if(!state.cart[i])return;
    state.cart[i].qty += delta;
    if(state.cart[i].qty<=0) state.cart.splice(i,1);
    renderCart();
  });

  $("#openCart").addEventListener("click",openCart);
  $("#closeCart").addEventListener("click",closeCart);
  $("#drawerBackdrop").addEventListener("click",closeCart);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeModal();}});

  function openModal(){
    if(!state.cart.length){showToast("Add a coffee before checkout");return;}
    closeCart();
    $("#checkoutModal").classList.add("show");
    $("#checkoutModal").setAttribute("aria-hidden","false");
    $("#customerName").focus();
  }
  function closeModal(){
    $("#checkoutModal").classList.remove("show");
    $("#checkoutModal").setAttribute("aria-hidden","true");
  }
  $("#checkoutBtn").addEventListener("click",openModal);
  $("#closeModal").addEventListener("click",closeModal);
  $("#checkoutModal").addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal();});

  $("#checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name=$("#customerName").value.trim();
    if(!name)return;
    const orderNo=Math.floor(1000+Math.random()*9000);
    const total=state.cart.reduce((s,x)=>s+x.price*x.qty,0);
    closeModal();
    state.cart=[];
    renderCart();
    showToast(`Order #${orderNo} confirmed • ${money(total)}`);
    e.target.reset();
  });

  // Small pointer-based depth effect for the hero cup.
  const stage=$(".coffee-stage");
  if(stage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    $(".hero-visual").addEventListener("pointermove",e=>{
      const r=e.currentTarget.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      stage.style.transform=`translate(${x*8}px,${y*8}px) rotateY(${x*5}deg)`;
    });
    $(".hero-visual").addEventListener("pointerleave",()=>stage.style.transform="");
  }

  renderMenu();
  renderCart();
  updateBuilder();
  initReveal();
})();