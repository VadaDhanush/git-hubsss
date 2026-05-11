import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Lbl, Bar5, Seg, Field, Btn, Ring } from '../components/UI';

const MUSCLES = ['Chest','Back','Legs','Shoulders','Arms','Core','Cardio','Full Body'];

export default function GymScreen({ log, upLog, data, last5, T }) {
  const [sub, setSub]    = useState('gym');
  const [form, setForm]  = useState({ name:'', sets:'', reps:'', kg:'', muscle:'Chest' });
  const [musclePicker, setMusclePicker] = useState(false);

  const exD5 = last5(l => l?.workouts?.length || 0);
  const wD5  = last5(l => parseFloat(l?.weight) || 0);
  const wMax = Math.max(...wD5.map(d=>d.v), data.profile.goal_weight+5);
  const bmi  = log.weight ? (log.weight/(1.75*1.75)).toFixed(1) : null;
  const bmiCol = !bmi?T.sub:bmi<18.5?'#38bdf8':bmi<25?T.green:bmi<30?T.amber:T.red;
  const bmiLbl = !bmi?'':bmi<18.5?'Underweight':bmi<25?'Healthy':bmi<30?'Overweight':'Obese';

  return (
    <ScrollView style={{ flex:1, backgroundColor:T.bg }} contentContainerStyle={{ padding:16, paddingBottom:24 }} showsVerticalScrollIndicator={false}>
      <Seg T={T} options={[['gym','💪 Workout'],['body','⚖️ Body']]} value={sub} onChange={setSub}/>

      {sub==='gym' && <>
        <Card T={T} accent>
          <Lbl T={T} color={T.accent}>Log Exercise</Lbl>

          {/* Name */}
          <Field T={T} value={form.name} onCommit={v=>setForm(f=>({...f,name:v}))}
            onChangeText={v=>setForm(f=>({...f,name:v}))}
            placeholder="Exercise name" style={{ marginBottom:8 }}/>

          {/* Muscle picker */}
          <TouchableOpacity onPress={() => setMusclePicker(!musclePicker)}
            style={{ backgroundColor:T.cardHi, borderWidth:1, borderColor:T.border,
              borderRadius:10, padding:10, marginBottom:8, flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ color:T.text, fontSize:14 }}>{form.muscle}</Text>
            <Text style={{ color:T.sub }}>▾</Text>
          </TouchableOpacity>
          {musclePicker && (
            <View style={{ backgroundColor:T.card, borderWidth:1, borderColor:T.border,
              borderRadius:10, marginBottom:8, overflow:'hidden' }}>
              {MUSCLES.map(m => (
                <TouchableOpacity key={m} onPress={() => { setForm(f=>({...f,muscle:m})); setMusclePicker(false); }}
                  style={{ padding:12, borderBottomWidth:1, borderBottomColor:T.border,
                    backgroundColor:form.muscle===m?T.aDim:'transparent' }}>
                  <Text style={{ color:form.muscle===m?T.accent:T.text, fontSize:13 }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sets / Reps / kg */}
          <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
            {[['Sets','sets','3'],['Reps','reps','10'],['kg','kg','—']].map(([l,k,ph]) => (
              <View key={k} style={{ flex:1 }}>
                <Text style={{ fontSize:10, fontWeight:'600', color:T.sub, marginBottom:5, textTransform:'uppercase', letterSpacing:0.6 }}>{l}</Text>
                <Field T={T} value={String(form[k]||'')} onCommit={v=>setForm(f=>({...f,[k]:v}))}
                  onChangeText={v=>setForm(f=>({...f,[k]:v}))}
                  keyboardType="number-pad" placeholder={ph} style={{ textAlign:'center' }}/>
              </View>
            ))}
          </View>

          <Btn T={T} col={T.accent} onPress={() => {
            if (!form.name.trim()) return;
            upLog({ workouts:[...(log.workouts||[]),{...form,id:Date.now()}] });
            setForm({ name:'', sets:'', reps:'', kg:'', muscle:'Chest' });
          }} style={{ width:'100%' }}>Add Exercise</Btn>
        </Card>

        <Card T={T}><Lbl T={T}>Workout Days — 5 Days</Lbl><Bar5 T={T} d5={exD5} maxV={Math.max(...exD5.map(d=>d.v),8)} col={T.red}/></Card>

        <Card T={T}>
          <Lbl T={T} right={`${(log.workouts||[]).length} total`}>Today's Workout</Lbl>
          {(log.workouts||[]).length===0
            ? <Text style={{ fontSize:13, color:T.dim, paddingVertical:8 }}>No exercises logged yet.</Text>
            : (log.workouts||[]).map((w,i) => (
              <View key={w.id} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
                paddingVertical:11, borderBottomWidth:i<(log.workouts||[]).length-1?1:0, borderBottomColor:T.border }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
                  <View style={{ width:3, height:34, borderRadius:2, backgroundColor:T.red }}/>
                  <View>
                    <Text style={{ fontSize:13, fontWeight:'600', color:T.text }}>{w.name}</Text>
                    <Text style={{ fontSize:11, color:T.sub, marginTop:1 }}>{w.muscle}</Text>
                  </View>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <Text style={{ fontSize:13, fontWeight:'700', color:T.text }}>{w.sets}×{w.reps}</Text>
                  {!!w.kg && <Text style={{ fontSize:11, color:T.dim }}>{w.kg} kg</Text>}
                </View>
              </View>
            ))
          }
        </Card>
      </>}

      {sub==='body' && <>
        <Card T={T}>
          <Text style={{ fontSize:10, fontWeight:'700', color:T.sub, letterSpacing:1, textTransform:'uppercase', textAlign:'center', marginBottom:14 }}>Today's Weight</Text>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 }}>
            <Field T={T} value={String(log.weight||'')} onCommit={v=>upLog({weight:v})}
              keyboardType="decimal-pad" placeholder="68.5"
              style={{ textAlign:'center', fontWeight:'800', fontSize:38, width:150, borderRadius:12, padding:10 }}/>
            <Text style={{ fontSize:18, color:T.sub }}>kg</Text>
          </View>
          {bmi && (
            <View style={{ flexDirection:'row', justifyContent:'center', gap:20,
              backgroundColor:T.cardHi, borderWidth:1, borderColor:T.border,
              borderRadius:12, padding:14, alignSelf:'center' }}>
              <View style={{ alignItems:'center' }}>
                <Text style={{ fontSize:24, fontWeight:'800', color:bmiCol }}>{bmi}</Text>
                <Text style={{ fontSize:10, color:T.dim, marginTop:2, textTransform:'uppercase', letterSpacing:0.8 }}>BMI</Text>
              </View>
              <View style={{ width:1, backgroundColor:T.border }}/>
              <View style={{ justifyContent:'center', alignItems:'center' }}>
                <Text style={{ fontSize:15, fontWeight:'700', color:bmiCol }}>{bmiLbl}</Text>
                <Text style={{ fontSize:10, color:T.dim, marginTop:2 }}>Status</Text>
              </View>
            </View>
          )}
        </Card>
        <Card T={T}><Lbl T={T} right={`Goal: ${data.profile.goal_weight} kg`}>Weight — 5 Days</Lbl><Bar5 T={T} d5={wD5} maxV={wMax} col="#a78bfa" unit="kg"/></Card>
      </>}
    </ScrollView>
  );
}
