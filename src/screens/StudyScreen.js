import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Lbl, PBar, Bar5, Field, Btn } from '../components/UI';

export default function StudyScreen({ log, upLog, data, last5, T }) {
  const [timer,   setTimer]   = useState(0);
  const [running, setRunning] = useState(false);
  const [subject, setSubject] = useState('');
  const ivRef = useRef(null);

  useEffect(() => {
    if (running) {
      ivRef.current = setInterval(() => setTimer(t => t+1), 1000);
    } else {
      clearInterval(ivRef.current);
    }
    return () => clearInterval(ivRef.current);
  }, [running]);

  const fmtT = s => {
    const h  = String(Math.floor(s/3600)).padStart(2,'0');
    const m  = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sc = String(s%60).padStart(2,'0');
    return `${h}:${m}:${sc}`;
  };

  const stop = () => {
    if (timer > 10 && subject.trim()) {
      upLog({ sessions:[...(log.sessions||[]), {
        s:subject.trim(), dur:timer,
        at:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
      }]});
    }
    setRunning(false); setTimer(0);
  };

  const totalSt  = (log.sessions||[]).reduce((a,s) => a+s.dur, 0);
  const studyPct = Math.min(100,(totalSt/(data.profile.goal_study*3600))*100);
  const studyD5  = last5(l => l?(l.sessions||[]).reduce((a,s)=>a+s.dur,0)/3600:0).map(d=>({...d,v:Math.round(d.v*10)/10}));

  return (
    <ScrollView style={{ flex:1, backgroundColor:T.bg }} contentContainerStyle={{ padding:16, paddingBottom:24 }} showsVerticalScrollIndicator={false}>

      {/* Timer card */}
      <Card T={T} accent>
        <Text style={{ fontSize:10, fontWeight:'700', color:T.sub, letterSpacing:1.4, textTransform:'uppercase', textAlign:'center', marginBottom:16 }}>Focus Timer</Text>

        <Text style={{ fontSize:60, fontWeight:'800', textAlign:'center', letterSpacing:2,
          color:running?T.text:T.sub, fontVariant:['tabular-nums'] }}>
          {fmtT(timer)}
        </Text>

        {running && (
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, marginTop:6 }}>
            <View style={{ width:6, height:6, borderRadius:3, backgroundColor:T.red }}/>
            <Text style={{ fontSize:10, fontWeight:'700', color:T.red, letterSpacing:1 }}>RECORDING</Text>
          </View>
        )}

        <Field T={T} value={subject} onCommit={() => {}}
          onChangeText={setSubject}
          placeholder="Subject / Topic" style={{ textAlign:'center', fontSize:14, marginTop:18, marginBottom:14 }}/>

        <View style={{ flexDirection:'row', gap:8 }}>
          <Btn T={T} col={running?T.red:T.accent} onPress={() => running?stop():setRunning(true)} style={{ flex:1 }}>
            {running?'⏹  Stop & Save':'▶  Start Session'}
          </Btn>
          {!running && timer>0 && (
            <Btn T={T} col={T.sub} outline onPress={() => setTimer(0)} style={{ paddingHorizontal:16 }}>↺</Btn>
          )}
        </View>
      </Card>

      {/* Progress */}
      <Card T={T}>
        <Lbl T={T} right={`${Math.round(studyPct)}%`}>Daily Goal — {data.profile.goal_study}h</Lbl>
        <PBar T={T} pct={studyPct} h={8}/>
        <Text style={{ fontSize:11, color:T.dim, marginTop:7 }}>{(totalSt/3600).toFixed(2)}h studied today</Text>
      </Card>

      {/* 5-day chart */}
      <Card T={T}>
        <Lbl T={T} right={`avg ${(studyD5.reduce((a,d)=>a+d.v,0)/5).toFixed(1)}h/day`}>Last 5 Days</Lbl>
        <Bar5 T={T} d5={studyD5} maxV={data.profile.goal_study} col={T.accent} unit="h"/>
      </Card>

      {/* Sessions list */}
      <Card T={T}>
        <Lbl T={T} right={totalSt>0?fmtT(totalSt).slice(0,5):''}>Sessions Today</Lbl>
        {(log.sessions||[]).length===0
          ? <Text style={{ fontSize:13, color:T.dim, paddingVertical:8 }}>No sessions yet — start the timer above.</Text>
          : (log.sessions||[]).map((s,i) => (
            <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
              paddingVertical:10, borderBottomWidth:i<(log.sessions||[]).length-1?1:0, borderBottomColor:T.border }}>
              <View>
                <Text style={{ fontSize:13, fontWeight:'600', color:T.text }}>{s.s}</Text>
                <Text style={{ fontSize:11, color:T.dim, marginTop:2 }}>{s.at}</Text>
              </View>
              <Text style={{ fontSize:13, fontWeight:'700', color:T.accent, fontVariant:['tabular-nums'] }}>{fmtT(s.dur).slice(0,5)}</Text>
            </View>
          ))
        }
      </Card>
    </ScrollView>
  );
}
