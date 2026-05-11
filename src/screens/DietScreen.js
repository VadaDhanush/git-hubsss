import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Lbl, PBar, Bar5, Field } from '../components/UI';

export default function DietScreen({ log, upLog, data, last5, T }) {
  const calD5 = last5(l => parseInt(l?.macros?.cal) || 0);
  const cal   = parseInt(log.macros?.cal) || 0;

  return (
    <ScrollView style={{ flex:1, backgroundColor:T.bg }} contentContainerStyle={{ padding:16, paddingBottom:24 }} showsVerticalScrollIndicator={false}>

      {/* Macro tiles */}
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:10 }}>
        {[
          {k:'cal', l:'Calories', u:'kcal', col:T.amber},
          {k:'pro', l:'Protein',  u:'g',    col:T.green},
          {k:'carb',l:'Carbs',    u:'g',    col:'#38bdf8'},
          {k:'fat', l:'Fat',      u:'g',    col:T.red},
        ].map(m => (
          <View key={m.k} style={{ width:'48%', backgroundColor:T.card, borderWidth:1, borderColor:T.border, borderRadius:14, padding:13 }}>
            <Text style={{ fontSize:10, fontWeight:'700', color:m.col, letterSpacing:0.8, textTransform:'uppercase', marginBottom:8 }}>{m.l}</Text>
            <Field T={T} value={String(log.macros?.[m.k]||'')}
              onCommit={v=>upLog({macros:{...log.macros,[m.k]:v}})}
              keyboardType="number-pad" placeholder="0"
              style={{ fontSize:26, fontWeight:'800', textAlign:'center',
                backgroundColor:'transparent', borderWidth:0, padding:0, color:T.text }}/>
            <Text style={{ fontSize:10, color:T.dim, marginTop:2 }}>{m.u}</Text>
          </View>
        ))}
      </View>

      {/* Calories chart */}
      <Card T={T}><Lbl T={T} right={cal?`${cal} kcal today`:''}>Calories — 5 Days</Lbl><Bar5 T={T} d5={calD5} maxV={2500} col={T.amber}/></Card>

      {/* Meals */}
      <Card T={T}>
        <Lbl T={T}>Meals</Lbl>
        {[['breakfast','Breakfast','🌅'],['lunch','Lunch','☀️'],['dinner','Dinner','🌙'],['snacks','Snacks','🍎']].map(([k,l,ic]) => (
          <View key={k} style={{ marginBottom:10 }}>
            <Text style={{ fontSize:11, fontWeight:'600', color:T.sub, marginBottom:5 }}>{ic} {l}</Text>
            <Field T={T} value={log.meals?.[k]||''} onCommit={v=>upLog({meals:{...log.meals,[k]:v}})}
              placeholder="What did you have?"/>
          </View>
        ))}
      </Card>

      {/* Water */}
      <Card T={T}>
        <Lbl T={T} right={`${log.water||0} / ${data.profile.goal_water} glasses`}>Water</Lbl>
        <PBar T={T} pct={(log.water||0)/data.profile.goal_water*100} h={7} col="#38bdf8"/>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:12 }}>
          {Array.from({length:data.profile.goal_water}).map((_,i) => (
            <TouchableOpacity key={i} onPress={() => upLog({water: i<(log.water||0)?(log.water||0)-1:i+1})}>
              <Text style={{ fontSize:24, opacity:i<(log.water||0)?1:0.2 }}>💧</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
