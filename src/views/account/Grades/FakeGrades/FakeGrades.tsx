import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { 
  NativeItem, 
  NativeList, 
  NativeListHeader, 
  NativeText 
} from "@/components/Global/NativeComponents";
import { v4 as uuid } from "uuid";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { Plus, X, Check, AlertCircle } from "lucide-react-native";
import MissingItem from "@/components/Global/MissingItem";
import type { Grade } from "@/services/shared/Grade";
import { getPronoteAverage } from "@/utils/grades/getAverages";
import { useGradesStore } from "@/stores/grades";

interface FakeGradesProps {
  periodName: string;
  currentGrades: Grade[];
  onFakeGradesChange: (fakeGrades: Grade[]) => void;
}

const FakeGrades: React.FC<FakeGradesProps> = ({ 
  periodName, 
  currentGrades,
  onFakeGradesChange,
}) => {
  const theme = useTheme();
  const colors = theme.colors as any;
  const [fakeGrades, setFakeGrades] = useState<Grade[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState({
    value: "",
    outOf: "20",
    coefficient: "1",
    subjectName: "",
  });
  const [currentAverage, setCurrentAverage] = useState<number>(-1);
  const [newAverage, setNewAverage] = useState<number>(-1);

  useEffect(() => {
    // Calcul de la moyenne actuelle
    const avg = getPronoteAverage(currentGrades, "student");
    setCurrentAverage(avg);

    // Calcul de la nouvelle moyenne avec les fausses notes
    const avgWithFake = getPronoteAverage([...currentGrades, ...fakeGrades], "student");
    setNewAverage(avgWithFake);

    // Notifier le parent du changement de fausses notes
    onFakeGradesChange(fakeGrades);
  }, [currentGrades, fakeGrades]);

  const addFakeGrade = () => {
    const value = parseFloat(newGrade.value);
    const outOf = parseFloat(newGrade.outOf);
    const coef = parseFloat(newGrade.coefficient);

    if (isNaN(value) || isNaN(outOf) || isNaN(coef) || !newGrade.subjectName) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs avec des valeurs valides");
      return;
    }

    if (value < 0 || outOf <= 0 || coef <= 0) {
      Alert.alert("Erreur", "Les valeurs doivent être positives");
      return;
    }

    const fakeGradeObj: Grade = {
      id: uuid(),
      subjectName: newGrade.subjectName,
      description: "Note simulée",
      timestamp: Date.now(),
      outOf: {
        value: outOf,
        disabled: false,
        status: null,
      },
      coefficient: coef,
      student: {
        value: value,
        disabled: false,
        status: null,
      },
      average: {
        value: null,
        disabled: true,
        status: null,
      },
      max: {
        value: null,
        disabled: true,
        status: null,
      },
      min: {
        value: null,
        disabled: true,
        status: null,
      },
      isBonus: false,
      isOptional: false,
    };

    setFakeGrades([...fakeGrades, fakeGradeObj]);
    setNewGrade({
      value: "",
      outOf: "20",
      coefficient: "1",
      subjectName: "",
    });
    setShowAddForm(false);
  };

  const removeFakeGrade = (id: string) => {
    setFakeGrades(fakeGrades.filter(g => g.id !== id));
  };

  const renderAddForm = () => {
    return (
      <Reanimated.View 
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(100)}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ marginBottom: 16 }}>
          <NativeText variant="subtitle" style={{ marginBottom: 4 }}>
            Matière
          </NativeText>
          <TextInput
            placeholder="Nom de la matière"
            value={newGrade.subjectName}
            onChangeText={text => setNewGrade({ ...newGrade, subjectName: text })}
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              padding: 12,
              borderRadius: 8,
              fontFamily: "regular",
            }}
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <NativeText variant="subtitle" style={{ marginBottom: 4 }}>
              Note
            </NativeText>
            <TextInput
              placeholder="Note"
              value={newGrade.value}
              onChangeText={text => setNewGrade({ ...newGrade, value: text })}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                padding: 12,
                borderRadius: 8,
                fontFamily: "regular",
              }}
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <View style={{ flex: 1 }}>
            <NativeText variant="subtitle" style={{ marginBottom: 4 }}>
              Sur
            </NativeText>
            <TextInput
              placeholder="Sur combien"
              value={newGrade.outOf}
              onChangeText={text => setNewGrade({ ...newGrade, outOf: text })}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                padding: 12,
                borderRadius: 8,
                fontFamily: "regular",
              }}
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <View style={{ flex: 1 }}>
            <NativeText variant="subtitle" style={{ marginBottom: 4 }}>
              Coefficient
            </NativeText>
            <TextInput
              placeholder="Coef"
              value={newGrade.coefficient}
              onChangeText={text => setNewGrade({ ...newGrade, coefficient: text })}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                padding: 12,
                borderRadius: 8,
                fontFamily: "regular",
              }}
              placeholderTextColor={colors.text + "80"}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowAddForm(false)}
            style={{
              backgroundColor: colors.border,
              borderRadius: 8,
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
            }}
          >
            <X size={18} color={colors.text} />
            <NativeText style={{ marginLeft: 4 }}>Annuler</NativeText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={addFakeGrade}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
            }}
          >
            <Check size={18} color="#fff" />
            <NativeText style={{ marginLeft: 4, color: "#fff" }}>Ajouter</NativeText>
          </TouchableOpacity>
        </View>
      </Reanimated.View>
    );
  };

  const renderFakeGradeItem = ({ item }: { item: Grade }) => {
    return (
      <NativeItem
        chevron={false}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View>
            <NativeText numberOfLines={1}>
              {item.subjectName}
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              {`Coefficient: ${item.coefficient}`}
            </NativeText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <NativeText
                style={{
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: "medium",
                }}
              >
                {(item.student.value ?? 0).toFixed(2)}
              </NativeText>
              <NativeText
                style={{
                  fontSize: 15,
                  lineHeight: 15,
                  opacity: 0.6,
                }}
              >
                /{(item.outOf.value ?? 20).toFixed(0)}
              </NativeText>
            </View>

            <TouchableOpacity
              onPress={() => removeFakeGrade(item.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.card,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </NativeItem>
    );
  };

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
      entering={animPapillon(FadeIn).duration(300)}
      exiting={animPapillon(FadeOut).duration(100)}
    >
      <NativeListHeader
        label="Simulation de notes"
        style={{ marginTop: 16 }}
        trailing={
          !showAddForm && (
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.card,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={18} color={colors.text} />
            </TouchableOpacity>
          )
        }
      />

      {showAddForm && renderAddForm()}

      {(currentAverage !== -1 || newAverage !== -1) && (
        <View 
          style={{ 
            backgroundColor: colors.card, 
            borderRadius: 16, 
            padding: 16, 
            marginHorizontal: 16,
            marginBottom: 16,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <View>
            <NativeText variant="subtitle">Moyenne actuelle</NativeText>
            <NativeText style={{ fontSize: 18, fontFamily: "semibold" }}>
              {currentAverage !== -1 ? currentAverage.toFixed(2) : "N/A"}
            </NativeText>
          </View>
          <View>
            <NativeText variant="subtitle">Moyenne simulée</NativeText>
            <NativeText 
              style={{ 
                fontSize: 18, 
                fontFamily: "semibold",
                color: newAverage > currentAverage ? "green" : newAverage < currentAverage ? "red" : colors.text
              }}
            >
              {newAverage !== -1 ? newAverage.toFixed(2) : "N/A"}
            </NativeText>
          </View>
        </View>
      )}

      {fakeGrades.length === 0 ? (
        <MissingItem
          style={{ marginTop: 8, marginHorizontal: 16 }}
          emoji="🔍"
          title="Aucune note simulée"
          description="Ajoutez des notes pour simuler votre moyenne"
        />
      ) : (
        <NativeList>
          {fakeGrades.map(grade => (
            <Reanimated.View
              key={grade.id}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(100)}
            >
              {renderFakeGradeItem({ item: grade })}
            </Reanimated.View>
          ))}
        </NativeList>
      )}
    </Reanimated.View>
  );
};

export default FakeGrades; 