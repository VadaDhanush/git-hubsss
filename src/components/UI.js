import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style, accent, T }) {
  return (
    <View style={[{
      backgroundColor: T.card,
      borderWidth: 1,
      borderColor: accent ? T.aBd : T.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      overflow: 'hidden',
    }, style]}>
      {accent && <View style={{ position:'absolute', top:0, left:0, width:3, bottom:0, backgroundColor:T.accent, borderTopLeftRadius:3, borderBottomLeftRadius:3 }}/>}
      {children}
    </View>
  );
}

// ── Section Label ─────────────────────────────────────────────
export function Lbl({ children, right, color, T }) {
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
      <Text style={{ fontSize:11, fontWeight:'700', color:color||T.sub, letterSpacing:0.9, textTransform:'uppercase' }}>{children}</Text>
      {right && <Text style={{ fontSize:11, color:T.dim }}>{right}</Text>}
    </View>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
export function PBar({ pct, col, h = 5, T }) {
  return (
    <View style={{ height:h, backgroundColor:T.border, borderRadius:999, overflow:'hidden' }}>
      <View style={{ height:'100%', width:`${Math.min(100, pct)}%`, backgroundColor:col||T.accent, borderRadius:999 }}/>
    </View>
  );
}

// ── Ring progress ─────────────────────────────────────────────
export function Ring({ pct, col, size = 72, sw = 5, top, bot, T }) {
  const c    = col || T.accent;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const d    = (Math.min(pct, 100) / 100) * circ;
  // rotate -90deg: use transform on the Svg
  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <Svg width={size} height={size} style={{ position:'absolute', transform:[{rotate:'-90deg'}] }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={T.border} strokeWidth={sw} fill="none"/>
        <Circle cx={size/2} cy={size/2} r={r} stroke={c} strokeWidth={sw} fill="none"
          strokeDasharray={`${d} ${circ}`} strokeLinecap="round"/>
      </Svg>
      <View style={{ alignItems:'center' }}>
        {top && <Text style={{ fontSize:size>80?13:10, fontWeight:'700', color:T.text, lineHeight:size>80?16:13 }}>{top}</Text>}
        {bot && <Text style={{ fontSize:size>80?9:8, color:T.sub }}>{bot}</Text>}
      </View>
    </View>
  );
}

// ── 5-Bar Chart ───────────────────────────────────────────────
export function Bar5({ d5, maxV, col, unit = '', T }) {
  const c    = col || T.accent;
  const bars = d5.slice(0, 5);
  const mx   = maxV || Math.max(...bars.map(b => b.v), 1);
  return (
    <View>
      <View style={{ flexDirection:'row', alignItems:'flex-end', height:90, gap:8 }}>
        {bars.map((b, i) => {
          const pct  = Math.min(100, (b.v / mx) * 100);
          const isT  = i === bars.length - 1;
          const barH = Math.max((pct / 100) * 90, 4);
          return (
            <View key={i} style={{ flex:1, height:90, justifyContent:'flex-end' }}>
              <View style={{ width:'100%', height:barH,
                backgroundColor: isT ? c : T.border,
                borderTopLeftRadius:5, borderTopRightRadius:5,
                borderBottomLeftRadius:2, borderBottomRightRadius:2,
                overflow:'hidden' }}>
                {isT && barH > 10 && (
                  <View style={{ position:'absolute', top:0, left:0, right:0, height:'35%',
                    backgroundColor:'rgba(255,255,255,0.18)',
                    borderTopLeftRadius:5, borderTopRightRadius:5 }}/>
                )}
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ height:1, backgroundColor:T.border, marginVertical:8 }}/>
      <View style={{ flexDirection:'row', gap:8 }}>
        {bars.map((b, i) => {
          const isT = i === bars.length - 1;
          return (
            <View key={i} style={{ flex:1, alignItems:'center' }}>
              <Text style={{ fontSize:10, fontWeight:'700', color:isT?c:T.dim, marginBottom:3 }}>
                {b.v > 0 ? `${b.v}${unit}` : '—'}
              </Text>
              <View style={{ backgroundColor:isT?`${c}20`:'transparent',
                borderRadius:5, paddingHorizontal:4, paddingVertical:1,
                borderWidth:isT?1:0, borderColor:isT?`${c}44`:'transparent' }}>
                <Text style={{ fontSize:9, color:isT?T.text:T.dim, fontWeight:isT?'700':'400' }}>{b.l}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Segment Control ───────────────────────────────────────────
export function Seg({ options, value, onChange, T }) {
  return (
    <View style={{ flexDirection:'row', backgroundColor:T.bgAlt,
      borderWidth:1, borderColor:T.border, borderRadius:12, padding:3,
      marginBottom:14, gap:2 }}>
      {options.map(([id, lbl]) => (
        <TouchableOpacity key={id} onPress={() => onChange(id)}
          style={{ flex:1, paddingVertical:8, borderRadius:9, alignItems:'center',
            backgroundColor: value===id ? T.card : 'transparent' }}>
          <Text style={{ fontSize:12, fontWeight:value===id?'600':'400', color:value===id?T.text:T.sub }}>
            {lbl}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Field (TextInput) ─────────────────────────────────────────
export function Field({ value, onCommit, style, multiline, T, ...rest }) {
  const [local, setLocal] = useState(value ?? '');
  const [focused, setFocused] = useState(false);
  // sync if parent changes while not focused
  React.useEffect(() => {
    if (!focused) setLocal(value ?? '');
  }, [value]);

  return (
    <TextInput
      {...rest}
      value={local}
      onChangeText={setLocal}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onCommit?.(local); }}
      multiline={multiline}
      style={[{
        backgroundColor: focused ? T.aDim : T.cardHi,
        borderWidth: 1,
        borderColor: focused ? T.aBd : T.border,
        borderRadius: 10,
        padding: 10,
        color: T.text,
        fontSize: 14,
        fontFamily: 'System',
      }, style]}
    />
  );
}

// ── Btn ───────────────────────────────────────────────────────
export function Btn({ children, onPress, col, outline = false, style, T }) {
  const c = col || T.accent;
  return (
    <TouchableOpacity onPress={onPress}
      style={[{
        paddingVertical:12, paddingHorizontal:18, borderRadius:10,
        alignItems:'center', justifyContent:'center',
        backgroundColor: outline ? `${c}12` : c,
        borderWidth: outline ? 1 : 0,
        borderColor: outline ? `${c}44` : 'transparent',
      }, style]}>
      <Text style={{ fontSize:13, fontWeight:'600', color: outline ? c : '#fff' }}>{children}</Text>
    </TouchableOpacity>
  );
}

// ── Steps Arc ─────────────────────────────────────────────────
export function StepsArc({ steps, goal, T }) {
  const pct  = Math.min(100, (steps / goal) * 100);
  const col  = pct >= 100 ? T.green : pct >= 60 ? T.accent : pct >= 30 ? T.amber : T.sub;
  const size = 140, sw = 11;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const d    = (pct / 100) * arc;

  return (
    <View style={{ alignItems:'center', paddingVertical:8 }}>
      <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
        <Svg width={size} height={size} style={{ position:'absolute', transform:[{rotate:'135deg'}] }}>
          <Circle cx={size/2} cy={size/2} r={r} stroke={T.border} strokeWidth={sw} fill="none"
            strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"/>
          <Circle cx={size/2} cy={size/2} r={r} stroke={col} strokeWidth={sw} fill="none"
            strokeDasharray={`${d} ${circ}`} strokeLinecap="round"/>
        </Svg>
        <View style={{ alignItems:'center' }}>
          <Text style={{ fontSize:9, fontWeight:'700', color:T.sub, letterSpacing:1.2, marginBottom:2 }}>STEPS</Text>
          <Text style={{ fontSize:32, fontWeight:'800', color:T.text, lineHeight:36 }}>
            {(steps || 0).toLocaleString()}
          </Text>
          <Text style={{ fontSize:11, color:T.sub }}>/ {goal.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={{ fontSize:12, fontWeight:'600', color:col, marginTop:6 }}>
        {pct >= 100 ? '🎯 Goal reached!' : pct >= 60 ? `${(goal-steps).toLocaleString()} steps to go` : pct >= 20 ? 'Keep going 💪' : 'Start moving 🚶'}
      </Text>
    </View>
  );
}

// ── Live Clock ────────────────────────────────────────────────
export function LiveClock({ T }) {
  const [time, setTime] = useState('');
  React.useEffect(() => {
    const tick = () => {
      const n = new Date();
      const h = String(n.getHours()).padStart(2,'0');
      const m = String(n.getMinutes()).padStart(2,'0');
      const s = String(n.getSeconds()).padStart(2,'0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return <Text style={{ fontSize:17, fontWeight:'700', color:T.accent, fontVariant:['tabular-nums'] }}>{time}</Text>;
}
