const fs = require('fs')
let trans = fs.readFileSync('src/components/TransitionControls.tsx', 'utf-8')
const search = `          ))}
        </div>
      </div>`
const presets = `          ))}
        </div>
        
        {/* Quick Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', marginTop: '6px', width: '100%' }}>
          {[1, 2, 3, 4].map(preset => (
            <button key={preset} className="trans-btn" style={{ padding: '4px 0', fontSize: '10px' }}>{preset}</button>
          ))}
        </div>
      </div>`
if (trans.includes(search)) {
  trans = trans.replace(search, presets)
  fs.writeFileSync('src/components/TransitionControls.tsx', trans)
  console.log('TransitionControls patched')
}
