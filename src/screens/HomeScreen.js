import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Lbl, PBar, Ring, Bar5, Field, StepsArc } from '../components/UI';

const MOODS = [{e:'😞',l:'Low'},{e:'😐',l:'Meh'},{e:'🙂',l:'OK'},{e:'😄',l:'Great'},{e:'🤩',l:'Best'}];

export default function HomeScreen({ log, upLog, data, last5, fmtT, totalSt, studyPct, T }) {
  const steps    = parseInt(log.steps) || 0;
  const stepPct  = Math.min(100, (steps / data.profile.goal_steps) * 100);
  const studyD5  = last5(l => l ? (l.sessions||[]).reduce((a,s)=>a+s.dur,0)/3600 : 0).map(d=>({...d,v:Math.round(d.v*10)/10}));
  const stepD5   = last5(l => Math.round((parseInt(l?.steps)||0)/100)*100);

  const hour  = new Date().getHours();
  const greet = hour<5?'Late night':hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';

  return (
    <ScrollView style={{ flex:1, backgroundColor:T.bg }} contentContainerStyle={{ padding:16, paddingBottom:24 }} showsVerticalScrollIndicator={false}>

      {/* Banner */}
      <View style={{ backgroundColor:T.aDim, borderWidth:1, borderColor:T.aBd,
        borderRadius:18, padding:18, marginBottom:12 }}>
        <Text style={{ fontSize:10, fontWeight:'700', color:T.accent, letterSpacing:1.2, textTransform:'uppercase', marginBottom:4 }}>{greet}</Text>
        <Text style={{ fontSize:26, fontWeight:'800', color:T.text, letterSpacing:-0.5 }}>Dhanush Jaddu</Text>
        <Text style={{ fontSize:11, color:T.sub, marginTop:5 }}>
          {new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
        </Text>
      </View>

      {/* Steps hero */}
      <Card T={T}>
        <Lbl T={T} right={`Goal: ${data.profile.goal_steps.toLocaleString()}`}>Daily Steps</Lbl>
        <StepsArc steps={steps} goal={data.profile.goal_steps} T={T}/>
        <Field T={T} value={String(log.steps||'')} onCommit={v=>upLog({steps:v})}
          keyboardType="number-pad" placeholder="Enter step count…"
          style={{ textAlign:'center', fontWeight:'700', fontSize:16, marginTop:12 }}/>
      </Card>

      {/* 4 stat tiles */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:10 }}>
        {[
          {l:'Study',    v:totalSt>0?fmtT(totalSt).slice(0,5):'—',  s:`Goal ${data.profile.goal_study}h`,  pct:studyPct,   col:T.accent},
          {l:'Weight',   v:log.weight?`${log.weight} kg`:'—',          s:"today's log",                       pct:log.weight?70:0, col:'#a78bfa'},
          {l:'Water',    v:`${log.water||0}/${data.profile.goal_water}`,s:'glasses',                           pct:(log.water||0)/data.profile.goal_water*100, col:'#38bdf8'},
          {l:'Workouts', v:`${(log.workouts||[]).length}`,              s:'logged today',                      pct:Math.min(100,(log.workouts||[]).length*14), col:T.red},
        ].map((s,i) => (
          <View key={i} style={{ width:'48%', backgroundColor:T.card, borderWidth:1, borderColor:T.border, borderRadius:14, padding:13 }}>
            <Text style={{ fontSize:10, fontWeight:'700', color:T.sub, letterSpacing:0.8, textTransform:'uppercase', marginBottom:8 }}>{s.l}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end' }}>
              <View>
                <Text style={{ fontSize:22, fontWeight:'800', color:T.text, letterSpacing:-0.5 }}>{s.v}</Text>
                <Text style={{ fontSize:10, color:T.dim, marginTop:3 }}>{s.s}</Text>
              </View>
              <Ring T={T} pct={s.pct} col={s.col} size={44} sw={4} top={`${Math.round(s.pct)}%`}/>
            </View>
          </View>
        ))}
      </View>

      {/* Charts */}
      <Card T={T}><Lbl T={T} right={`avg ${(studyD5.reduce((a,d)=>a+d.v,0)/5).toFixed(1)}h`}>Study — 5 Days</Lbl><Bar5 T={T} d5={studyD5} maxV={data.profile.goal_study} col={T.accent} unit="h"/></Card>
      <Card T={T}><Lbl T={T}>Steps — 5 Days</Lbl><Bar5 T={T} d5={stepD5} maxV={data.profile.goal_steps} col={T.green}/></Card>

      {/* Water */}
      <Card T={T}>
        <Lbl T={T} right={`${log.water||0} / ${data.profile.goal_water}`}>Water</Lbl>
        <PBar T={T} pct={(log.water||0)/data.profile.goal_water*100} h={6}/>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:12 }}>
          {Array.from({length:data.profile.goal_water}).map((_,i) => (
            <TouchableOpacity key={i} onPress={() => upLog({water: i<(log.water||0)?(log.water||0)-1:i+1})}>
              <Text style={{ fontSize:24, opacity:i<(log.water||0)?1:0.2 }}>💧</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Mood + Sleep */}
      <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
        <View style={{ flex:3, backgroundColor:T.card, borderWidth:1, borderColor:T.border, borderRadius:14, padding:13 }}>
          <Lbl T={T}>Mood</Lbl>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            {MOODS.map((m,i) => (
              <TouchableOpacity key={i} onPress={() => upLog({mood:m.e})} style={{ alignItems:'center', gap:3 }}>
                <Text style={{ fontSize:20, opacity:log.mood===m.e?1:0.22, transform:[{scale:log.mood===m.e?1.2:1}] }}>{m.e}</Text>
                <Text style={{ fontSize:8, color:log.mood===m.e?T.accent:T.dim, fontWeight:log.mood===m.e?'700':'400' }}>{m.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flex:2, backgroundColor:T.card, borderWidth:1, borderColor:T.border, borderRadius:14, padding:13 }}>
          <Lbl T={T}>Sleep hrs</Lbl>
          <Field T={T} value={String(log.sleep?.manualHrs||'')} onCommit={v=>upLog({sleep:{...log.sleep,manualHrs:v}})}
            keyboardType="decimal-pad" placeholder="7.5"
            style={{ textAlign:'center', fontWeight:'700', fontSize:18 }}/>
        </View>
      </View>

      {/* Quick habits */}
      <Card T={T}>
        <Lbl T={T}>Habits</Lbl>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:7 }}>
          {Object.entries(log.habits||{}).map(([h,done]) => (
            <TouchableOpacity key={h} onPress={() => upLog({habits:{...log.habits,[h]:!done}})}
              style={{ paddingHorizontal:13, paddingVertical:7, borderRadius:20,
                borderWidth:1, borderColor:done?T.aBd:T.border,
                backgroundColor:done?T.aDim:T.cardHi }}>
              <Text style={{ fontSize:12, color:done?T.accent:T.sub, fontWeight:done?'600':'400' }}>
                {done?'✓ ':''}{h.replace('_',' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Notes */}
      <Card T={T}>
        <Lbl T={T}>Notes</Lbl>
        <Field T={T} value={log.notes||''} onCommit={v=>upLog({notes:v})}
          multiline placeholder="Anything on your mind…"
          style={{ minHeight:60, textAlignVertical:'top', color:T.sub }}/>
      </Card>
    </ScrollView>
  );
}
