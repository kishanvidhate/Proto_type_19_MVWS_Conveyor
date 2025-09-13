// MVWS Calculator — Vanilla JS with BOM Unit column
(function(){
  const el = id => document.getElementById(id);
  const twoDP = v => Number.isFinite(v) ? Number(v).toFixed(2) : "—";
  const parse = id => {
    const n = Number(el(id).value);
    return Number.isFinite(n) ? n : 0;
  };

  // Enforce 2 decimal digits (except integer counters)
  const numInputs = document.querySelectorAll('input.num');
  numInputs.forEach(inp => {
    inp.addEventListener('blur', () => {
      const step = (inp.getAttribute('step') || "").toLowerCase();
      const n = Number(inp.value);
      if (!Number.isFinite(n)) { inp.value = ""; return; }
      inp.value = step === "1" ? String(Math.round(n)) : Number(n).toFixed(2);
    });
    inp.addEventListener('wheel', e => e.target.blur(), {passive:true});
  });

  const advBtn = el('toggle-adv');
  const advWrap = el('adv-wrap');
  advBtn?.addEventListener('click', () => {
    const expanded = advBtn.getAttribute('aria-expanded') === 'true';
    advBtn.setAttribute('aria-expanded', String(!expanded));
    advBtn.textContent = expanded ? 'Expand' : 'Collapse';
    advWrap.style.display = expanded ? 'none' : 'block';
  });

  function compute(){
    const conveyor_length_m = parse('conveyor_length_m');
    const conveyor_width_m = parse('conveyor_width_m');
    const num_belts = Math.max(1, Math.round(parse('num_belts')));
    const max_nozzle_spacing_m = Math.max(0.01, parse('max_nozzle_spacing_m'));
    const nozzles_per_location = Math.max(1, Math.round(parse('nozzles_per_location')));
    const lhs_runs_three_side = el('lhs_runs_three_side').checked;
    const lhs_cable_qty_to_panel = parse('lhs_cable_qty_to_panel');
    const distance_deluge_to_hydrant_m = parse('distance_deluge_to_hydrant_m');
    const system_pressure_bar = parse('system_pressure_bar');

    // Core calcs
    const locations_per_belt = Math.ceil(conveyor_length_m / max_nozzle_spacing_m);
    const nozzles_per_belt = locations_per_belt * nozzles_per_location;
    const total_nozzles = nozzles_per_belt * num_belts;
    const flow_per_nozzle_lps = 0.50;
    const total_flow_lps = total_nozzles * flow_per_nozzle_lps;
    const sides = lhs_runs_three_side ? 3 : 2;
    const lhs_cable_total_m = (conveyor_length_m * sides) + lhs_cable_qty_to_panel;
    const pipe_run_m = conveyor_length_m * num_belts;
    let deluge;
    if (total_flow_lps <= 50) deluge = "DN80";
    else if (total_flow_lps <= 100) deluge = "DN100";
    else deluge = "DN150";
    const deluge_valve = `${deluge} (based on ~${twoDP(total_flow_lps)} L/s)`;

    // Paint results
    el('r_total_nozzles').textContent = String(total_nozzles);
    el('r_total_flow_lps').textContent = twoDP(total_flow_lps);
    el('r_deluge_valve').textContent = deluge_valve;
    el('r_lhs_cable_total_m').textContent = twoDP(lhs_cable_total_m);
    el('r_pipe_run_m').textContent = twoDP(pipe_run_m);

    // BOM with explicit Unit column (18 rows)
    const bomRows = [
      { sr: 1,  qty: 1,   desc: '100 mm Cast Iron Deluge Valve with Wet Pilot Basic Trim Assembly', unit: 'Nos' },
      { sr: 2,  qty: 18,  desc: '100 mm M.S Pipes Heavy C Class As Per IS: 1239', unit: 'Meter' },
      { sr: 3,  qty: 156, desc: '100 mm G.I. Pipes Heavy C Class As Per IS: 1239', unit: 'Meter' },
      { sr: 4,  qty: 60,  desc: '80 mm G.I. Pipes Heavy C Class As Per IS: 1239', unit: 'Meter' },
      { sr: 5,  qty: 228, desc: '25 mm G.I. Pipes Heavy C Class As Per IS: 1239', unit: 'Meter' },
      { sr: 6,  qty: 4,   desc: '100 mm Cast Iron Wafer Type Butterfly Valve', unit: 'Nos' },
      { sr: 7,  qty: 1,   desc: "100 mm MS Y Type Strainers - Body : MS as per get('IS1239') (I)", unit: 'Nos' },
      { sr: 8,  qty: total_nozzles, desc: 'Medium Velocity Water Spray Nozzle Nickel Chrome Plated Brass 1/2\" BSPT', unit: 'Nos' },
      { sr: 9,  qty: 587, desc: 'Digital Linear Heat Detection Cable Alarm Temperature 70°C', unit: 'Nos' },
      { sr:10,  qty: 1,   desc: 'Deluge Valve Control Panel Outdoor with Canopy and IP65 Protection', unit: 'Nos' },
      { sr:11,  qty: 2,   desc: 'Pressure Switch with All Accessories. Range : 2-14 kg.', unit: 'Nos' },
      { sr:12,  qty: 1,   desc: '24 VDC Solenoid Valve, Operating Pressure: 1 - 20 Bar, 1/2\" BSPT', unit: 'Nos' },
      { sr:13,  qty: 2,   desc: 'Monitor Module, if applicable', unit: 'Nos' },
      { sr:14,  qty: 1,   desc: 'Control Nodule, if applicable', unit: 'Nos' },
      { sr:15,  qty: 2,   desc: '12V - 10 AMPS Battery', unit: 'Nos' },
      { sr:16,  qty: 1,   desc: 'Cables and Accessories', unit: 'Lot' },
      { sr:17,  qty: 1,   desc: 'Other Hardware Like Nut Bolts, U Clamps Anchor Fastener, Flanges & Green Gasket Etc.', unit: 'Lot' },
      { sr:18,  qty: 539, desc: 'MS Support Made of L Angle, C Channel, & MS Plate Etc.', unit: 'Kg' },
    ];

    const tbody = document.querySelector('#bom tbody');
    tbody.innerHTML = "";
    for (const r of bomRows){
      const qtyDisplay = Number.isInteger(r.qty) ? String(r.qty) : twoDP(r.qty);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.sr}</td><td class="right">${qtyDisplay}</td><td>${r.desc}</td><td>${r.unit}</td>`;
      tbody.appendChild(tr);
    }

    return {
      conveyor_length_m, conveyor_width_m, num_belts, max_nozzle_spacing_m, nozzles_per_location,
      lhs_runs_three_side, lhs_cable_qty_to_panel, distance_deluge_to_hydrant_m, system_pressure_bar,
      total_nozzles, total_flow_lps, deluge_valve, lhs_cable_total_m, pipe_run_m
    };
  }

  el('btn-calc').addEventListener('click', compute);

  el('btn-reset').addEventListener('click', () => {
    document.querySelectorAll('input.num').forEach(inp => {
      const step = (inp.getAttribute('step') || "").toLowerCase();
      inp.value = step === "1" ? "0" : "0.00";
    });
    el('conveyor_length_m').value = "50.00";
    el('conveyor_width_m').value = "1.20";
    el('num_belts').value = "1";
    el('max_nozzle_spacing_m').value = "2.50";
    el('nozzles_per_location').value = "2";
    el('lhs_runs_three_side').checked = false;
    el('lhs_cable_qty_to_panel').value = "25.00";
    el('distance_deluge_to_hydrant_m').value = "15.00";
    el('system_pressure_bar').value = "7.00";
    ['r_total_nozzles','r_total_flow_lps','r_deluge_valve','r_lhs_cable_total_m','r_pipe_run_m'].forEach(id => {
      document.getElementById(id).textContent = "—";
    });
    window.scrollTo({top:0,behavior:"smooth"});
  });

  el('btn-pdf').addEventListener('click', () => {
    const data = compute();
    const w = window.open("", "_blank", "width=900,height=1000");
    const css = `
      body{font-family:Arial, sans-serif; padding:24px}
      h1,h2{margin:0 0 8px 0}
      .muted{color:#555}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #999;padding:6px;text-align:left}
      th.right, td.right{text-align:right}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
      .kv{border:1px solid #999;padding:6px}
      .kv .k{font-weight:bold}
    `;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>MVWS Report</title><style>${css}</style></head><body>`);
    w.document.write(`<h1>MVWS Conveyor Calculation — Report</h1>`);
    w.document.write(`<p class="muted">Generated on ${new Date().toLocaleString()}</p>`);

    w.document.write(`<h2>Inputs</h2><div class="grid">`);
    const inputs = [
      ["Conveyor length (m)", data.conveyor_length_m.toFixed(2)],
      ["Conveyor width (m)", data.conveyor_width_m.toFixed(2)],
      ["No. of belts", data.num_belts],
      ["Max nozzle spacing (m)", data.max_nozzle_spacing_m.toFixed(2)],
      ["Nozzles per location", data.nozzles_per_location],
      ["LHS cable runs three sides?", data.lhs_runs_three_side ? "Yes" : "No"],
      ["LHS cable qty to panel (m)", data.lhs_cable_qty_to_panel.toFixed(2)],
      ["Distance deluge valve to hydrant (m)", data.distance_deluge_to_hydrant_m.toFixed(2)],
      ["System pressure (bar)", data.system_pressure_bar.toFixed(2)]
    ];
    for (const [k,v] of inputs){
      w.document.write(`<div class="kv"><div class="k">${k}</div><div>${v}</div></div>`);
    }
    w.document.write(`</div>`);

    w.document.write(`<h2>Results</h2>`);
    w.document.write(`<div class="grid">
      <div class="kv"><div class="k">Total nozzles</div><div>${data.total_nozzles}</div></div>
      <div class="kv"><div class="k">Estimated total flow (L/s)</div><div>${data.total_flow_lps.toFixed(2)}</div></div>
      <div class="kv"><div class="k">Deluge valve</div><div>${data.deluge_valve}</div></div>
      <div class="kv"><div class="k">LHS cable total (m)</div><div>${data.lhs_cable_total_m.toFixed(2)}</div></div>
      <div class="kv"><div class="k">Pipe run (approx, m)</div><div>${data.pipe_run_m.toFixed(2)}</div></div>
    </div>`);

    const bom = document.querySelector('#bom').outerHTML;
    w.document.write(`<h2>Bill of Materials</h2>${bom}`);

    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  });

  // Initial render
  compute();
})();