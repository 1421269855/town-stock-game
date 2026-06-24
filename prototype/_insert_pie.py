import re

with open('index.html', 'r', encoding='utf8') as f:
    content = f.read()

pie_code = r"""}

/* ========== HOLDINGS PIE ========== */
var PIE_COLORS = ['#58a6ff','#3fb950','#f0883e','#bc8cff','#f85149','#79c0ff','#56d364','#d29922','#a371f7','#ff7b72'];

function renderHoldingsPie() {
  try {
    var slices = [];
    for (var i = 0; i < S.length; i++) {
      if (S[i].shares > 0) {
        slices.push({name:S[i].name, icon:S[i].icon, val:S[i].shares * S[i].price});
      }
    }
    if (slices.length === 0) {
      $('holdingsPie').innerHTML = '<div class="empty-state">暂无持仓，没法画饼 🥧</div>';
      return;
    }
    slices.sort(function(a,b){return b.val-a.val;});
    var show = slices.slice(0, 8);
    var otherVal = 0;
    for (var oi = 8; oi < slices.length; oi++) otherVal += slices[oi].val;
    if (otherVal > 0) show.push({name:'其他', icon:'📦', val:otherVal});
    var total = 0; for (var ti = 0; ti < show.length; ti++) total += show[ti].val;

    var W = 700, H = 260, cx = 110, cy = Math.floor(H/2), r = 90;
    var cumAngle = -Math.PI/2;
    var paths = '', legends = '';

    for (var si = 0; si < show.length; si++) {
      var s = show[si], pct = s.val/total, angle = pct*2*Math.PI;
      var endA = cumAngle+angle;
      var x1=cx+r*Math.cos(cumAngle), y1=cy+r*Math.sin(cumAngle);
      var x2=cx+r*Math.cos(endA), y2=cy+r*Math.sin(endA);
      var large = angle>Math.PI?1:0;
      var d='M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 '+large+' 1 '+x2+','+y2+' Z';
      var c=PIE_COLORS[si%PIE_COLORS.length];
      paths+='<path d="'+d+'" fill="'+c+'" stroke="#0d1117" stroke-width="2" opacity="0.85" style="cursor:pointer;transition:opacity .15s"'+
        ' onmouseover="this.setAttribute(\'opacity\',\'1\');this.setAttribute(\'stroke-width\',\'3\')"'+
        ' onmouseout="this.setAttribute(\'opacity\',\'0.85\');this.setAttribute(\'stroke-width\',\'2\')">'+
        '<title>'+s.icon+' '+s.name+'\n$'+s.val.toFixed(0)+' ('+(pct*100).toFixed(1)+'%)</title></path>';
      var lY=20+si*28;
      legends+='<g transform="translate(230,'+lY+')"><rect x="0" y="0" width="14" height="14" rx="3" fill="'+c+'"/><text x="20" y="12" fill="#c9d1d9" font-size="12">'+s.icon+' '+s.name+'</text>'+
        '<text x="210" y="12" fill="#8b949e" font-size="11" text-anchor="end">$'+s.val.toFixed(0)+' ('+(pct*100).toFixed(1)+'%)</text></g>';
      cumAngle=endA;
    }

    $('holdingsPie').innerHTML = '<div style="font-size:13px;font-weight:600;color:#c9d1d9;margin-bottom:8px">🥧 持仓分布</div>'+
      '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">'+paths+legends+'</svg>';
  } catch(e) { showErr('pie: '+e.message); }
}

/* ========== ASSET CHART ========== */
function renderAssetChart() {
"""

marker = '/* ========== ASSET CHART ========== */\nfunction renderAssetChart() {'

if marker in content:
    content = content.replace(marker, pie_code)
    print('Replacement done!')
else:
    print('ERROR: marker not found!')
    # Show what's around that area
    idx = content.find('renderAssetChart')
    if idx >= 0:
        print('Found renderAssetChart at position', idx)
        print('Context:', repr(content[idx-50:idx+80]))

with open('index.html', 'w', encoding='utf8') as f:
    f.write(content)
print('File written successfully')
