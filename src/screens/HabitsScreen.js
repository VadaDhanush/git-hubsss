import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { Card, Lbl, PBar, Bar5, Seg, Ring, Field, LiveClock } from '../components/UI';

const QEM  = ['😴','😪','😐','😊','🤩'];
const QLBL = ['Poor','Fair','Okay','Good','Great'];
const WIND = [
  {t:'9:00 PM', l:'Stop screens'},
  {t:'9:30 PM', l:'Dim lights & stretch'},
  {t:'10:15 PM',l:'Wind-down routine'},
  {t:'10:30 PM',l:'In bed, read or journal'},
  {t:'11:00 PM',l:'Lights off'},
  {t:'6:00 AM', l:'Rise & get sunlight'},
];
const HMETA = {
  meditation:{l:'Meditation', i:'🧘'},
  reading:   {l:'Reading',    i:'📚'},
  no_junk:   {l:'No Junk Food',i:'🥗'},
  walk:      {l:'Walk / Move',i:'🚶'},
};

export default function HabitsScreen({ log, upLog, data, last5, T }) {
  const [sub, setSub] = useState('habits');
  const [liveSteps, setLiveSteps] = useState(parseInt(log.steps)||0);
  const pedometerRef = useRef(null);

  // ── Live pedometer ──────────────────────────────────────────
  useEffect(() => {
    let sub;
    Pedometer.isAvailableAsync().then(available => {
      if (available) {
        sub = Pedometer.watchStepCount(result => {
          setLiveSteps(result.steps);
          // Also save to store so it persists
          upLog({ steps: String(result.steps) });
        });
      }
    }).catch(() => {});
    return () => sub?.remove();
  }, []);

  const steps    = liveSteps || parseInt(log.steps) || 0;
  const stepPct  = Math.min(100, (steps / data.profile.goal_steps) * 100);
  const streak   = Object.values(data.logs).filter(l => Object.values(l?.habits||{}).some(Boolean)).length;
  const habitD5  = last5(l => l?.habits ? Object.values(l.habits).filter(Boolean).length : 0);
  const stepD5   = last5(l => Math.round((parseInt(l?.steps)||0)/100)*100);

  const sl  = log.sleep || {};
  const calcDur = (b, w) => {
    if (!b || !w) return null;
    const [bh,bm] = b.split(':').map(Number), [wh,wm] = w.split(':').map(Number);
    let m = (wh*60+wm)-(bh*60+bm); if (m < 0) m += 1440;
    return { hrs:m/60, label:`${Math.floor(m/60)}h ${m%60}m` };
  };
  const dur  = calcDur(sl.bed, sl.wake);
  const scol = !dur?T.sub:dur.hrs>=7.5?T.green:dur.hrs>=6?T.amber:T.red;
  const upSl = p => upLog({ sleep:{...sl,...p} });

  const sleepD5 = last5(l => {
    if (!l?.sleep) return 0;
    const d = calcDur(l.sleep.bed, l.sleep.wake);
    return d ? Math.round(d.hrs*10)/10 : 0;
  });

  return (
    <ScrollView style={{ flex:1, backgroundColor:T.bg }} contentContainerStyle={{ padding:16, paddingBottom:24 }} showsVerticalScrollIndicator={false}>
      <Seg T={T} options={[['habits','Habits & Steps'],['sleep','Sleep']]} value={sub} onChange={setSub}/>

      {sub==='habits' && <>
        {/* Streak + live clock */}
        <Card T={T}>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <View style={{ width:50, height:50, borderRadius:13,
              backgroundColor:`${T.amber}22`, borderWidth:1, borderColor:`${T.amber}44`,
              alignItems:'center', justifyContent:'center', marginRight:12 }}>
              <Text style={{ fontSize:26 }}>🔥</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:28, fontWeight:'800', color:T.text, lineHeight:30 }}>{streak}</Text>
              <Text style={{ fontSize:10, color:T.sub, marginTop:2 }}>active days</Text>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              <LiveClock T={T}/>
              <Text style={{ fontSize:9, color:T.dim, marginTop:2, letterSpacing:0.8 }}>TODAY LIVE</Text>
            </View>
          </View>
        </Card>

        {/* Live steps card */}
        <Card T={T}>
          <Lbl T={T}>Steps — Live</Lbl>
          <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:30, fontWeight:'800', color:stepPct>=100?T.green:T.text, fontVariant:['tabular-nums'], letterSpacing:-0.5 }}>
                {steps.toLocaleString()}
              </Text>
              <PBar T={T} pct={stepPct} col={stepPct>=100?T.green:T.accent} h={5}/>
              <Text style={{ fontSize:10, color:T.dim, marginTop:5 }}>Goal: {data.profile.goal_steps.toLocaleString()} steps</Text>
            </View>
            <Ring T={T} pct={stepPct} col={stepPct>=100?T.green:T.accent} size={68} sw={6}
              top={`${Math.round(stepPct)}%`} bot="done"/>
          </View>
          <Text style={{ fontSize:11, color:T.sub, marginTop:10 }}>
            📱 Steps are tracked automatically from your phone's sensor
          </Text>
        </Card>

        {/* Habits list */}
        <Card T={T}>
          <Lbl T={T}>Today's Habits</Lbl>
          {Object.entries(log.habits||{}).map(([h,done]) => {
            const m = HMETA[h] || {l:h, i:'·'};
            return (
              <TouchableOpacity key={h} onPress={() => upLog({habits:{...log.habits,[h]:!done}})}
                style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12,
                  borderBottomWidth:1, borderBottomColor:T.border }}>
                <View style={{ width:40, height:40, borderRadius:10,
                  backgroundColor:done?T.aDim:T.cardHi,
                  borderWidth:1, borderColor:done?T.aBd:T.border,
                  alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:18 }}>{m.i}</Text>
                </View>
                <Text style={{ flex:1, fontSize:13, fontWeight:done?'600':'400', color:done?T.text:T.sub }}>{m.l}</Text>
                <View style={{ width:22, height:22, borderRadius:6,
                  backgroundColor:done?T.accent:T.cardHi,
                  borderWidth:done?0:1, borderColor:T.border,
                  alignItems:'center', justifyContent:'center' }}>
                  {done && <Text style={{ fontSize:12, color:'#fff', fontWeight:'700' }}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card T={T}><Lbl T={T} right="max 4/day">Habits — 5 Days</Lbl><Bar5 T={T} d5={habitD5} maxV={4} col={T.accent}/></Card>
        <Card T={T}><Lbl T={T}>Steps — 5 Days</Lbl><Bar5 T={T} d5={stepD5} maxV={data.profile.goal_steps} col={T.green}/></Card>
      </>}

      {sub==='sleep' && <>
        {/* Duration hero */}
        <Card T={T}>
          <Text style={{ fontSize:10, fontWeight:'700', color:T.sub, letterSpacing:1, textTransform:'uppercase', textAlign:'center', marginBottom:14 }}>Last Night's Sleep</Text>
          <Text style={{ fontSize:48, fontWeight:'800', color:scol, textAlign:'center', letterSpacing:-1 }}>{dur?dur.label:'— —'}</Text>
          {dur && <Text style={{ fontSize:12, color:scol, fontWeight:'600', textAlign:'center', marginTop:8 }}>
            {dur.hrs>=8?'Excellent rest':dur.hrs>=7?'Good sleep':dur.hrs>=6?'Slightly short':'Sleep deprived'}
          </Text>}
          <View style={{ alignItems:'center', marginTop:18 }}>
            <Ring T={T} pct={dur?Math.min(100,(dur.hrs/9)*100):0} col={scol} size={90} sw={8}
              top={dur?`${dur.hrs.toFixed(1)}h`:'—'} bot="of 9h goal"/>
          </View>
        </Card>

        {/* Log times */}
        <Card T={T}>
          <Lbl T={T}>Log Sleep Times</Lbl>
          <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
            {[['Bedtime 🌙','bed'],['Wake Time ☀️','wake']].map(([l,k]) => (
              <View key={k} style={{ flex:1 }}>
                <Text style={{ fontSize:11, fontWeight:'600', color:T.sub, marginBottom:5 }}>{l}</Text>
                <Field T={T} value={sl[k]||''} onCommit={v=>upSl({[k]:v})} placeholder="HH:MM"/>
              </View>
            ))}
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
            {[['Target Bed','tBed','22:30'],['Target Wake','tWake','06:00']].map(([l,k,def]) => (
              <View key={k} style={{ flex:1 }}>
                <Text style={{ fontSize:11, fontWeight:'600', color:T.sub, marginBottom:5 }}>{l}</Text>
                <Field T={T} value={sl[k]||def} onCommit={v=>upSl({[k]:v})} placeholder={def}/>
              </View>
            ))}
          </View>
        </Card>

        {/* Quality */}
        <Card T={T}>
          <Lbl T={T}>Sleep Quality</Lbl>
          <View style={{ flexDirection:'row', gap:6 }}>
            {QEM.map((q,i) => (
              <TouchableOpacity key={i} onPress={() => upSl({quality:q})}
                style={{ flex:1, paddingVertical:10, borderRadius:10, alignItems:'center', gap:4,
                  borderWidth:1, borderColor:sl.quality===q?T.aBd:T.border,
                  backgroundColor:sl.quality===q?T.aDim:T.cardHi }}>
                <Text style={{ fontSize:20 }}>{q}</Text>
                <Text style={{ fontSize:9, fontWeight:'600', color:sl.quality===q?T.accent:T.dim }}>{QLBL[i]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card T={T}><Lbl T={T} right={dur?`${dur.hrs.toFixed(1)}h last night`:''}>Sleep — 5 Days</Lbl><Bar5 T={T} d5={sleepD5} maxV={9} col="#a78bfa" unit="h"/></Card>

        {/* Wind-down */}
        <Card T={T}>
          <Lbl T={T}>Wind-Down Schedule</Lbl>
          {WIND.map((w,i) => (
            <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
              paddingVertical:9, borderBottomWidth:i<WIND.length-1?1:0, borderBottomColor:T.border }}>
              <Text style={{ fontSize:13, color:T.sub }}>{w.l}</Text>
              <View style={{ backgroundColor:T.cardHi, borderWidth:1, borderColor:T.border, borderRadius:6, paddingHorizontal:9, paddingVertical:3 }}>
                <Text style={{ fontSize:11, fontWeight:'700', color:T.text }}>{w.t}</Text>
              </View>
            </View>
          ))}
        </Card>
      </>}
    </ScrollView>
  );
}
