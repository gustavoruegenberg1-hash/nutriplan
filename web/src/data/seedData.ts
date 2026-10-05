import { FoodItem, Exercise } from '../types';
import ALL_TACO_FOODS from './tacoFoods.json';

export const SEED_FOODS: FoodItem[] = (ALL_TACO_FOODS as any[]).map((f: any) => ({
  id: f.id,
  name: f.name,
  source: f.source || 'TACO',
  category: f.category,
  caloriesPer100g: Number(f.caloriesPer100g) || 0,
  proteinPer100g: Number(f.proteinPer100g) || 0,
  carbsPer100g: Number(f.carbsPer100g) || 0,
  fatPer100g: Number(f.fatPer100g) || 0,
  fiberPer100g: Number(f.fiberPer100g) || 0,
  micronutrients: f.micronutrients || null,
  legacyId: f.legacyId,
  isVerified: f.isVerified ?? true,
}));

export const SEED_EXERCISES: Exercise[] = [
  {
    "id": "0387f140-c13c-4148-9232-053bb4a17eb6",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Abdominal infra suspenso na barra fixa ou na paralela",
    "equipment": "Barra"
  },
  {
    "id": "0709778e-0715-4272-bb58-cc9c2bd3d4b4",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Cadeira extensora (Leg Extension Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "0756d0c3-119e-4543-a6dc-794cf2ea0cea",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca Scott com barra W no banco Scott",
    "equipment": "Barra"
  },
  {
    "id": "08113bad-517b-4f70-94cc-7a2e4bf68607",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada articulada na máquina (pegada neutra/pronada)",
    "equipment": "Máquina"
  },
  {
    "id": "093e17ec-0da1-4246-acbc-6ee5e3b3d6da",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Cadeira flexora sentada (Seated Leg Curl)",
    "equipment": "Máquina"
  },
  {
    "id": "0a419fc8-09a5-42f9-b669-22a5ae4d1a18",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FOREARMS",
    "name": "Rosca punho na polia ou com barra (Flexão de punho)",
    "equipment": "Barra"
  },
  {
    "id": "0ac13616-3292-44cd-8a90-80c1a8eadabe",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Elevação pélvica na máquina articulada (Hip Thrust Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "0bd0033f-c927-4844-9225-408567385444",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Cadeira extensora unilateral",
    "equipment": "Máquina"
  },
  {
    "id": "0c5f0372-5fc7-4631-837b-ddd89ece6a93",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca martelo na polia baixa com corda",
    "equipment": "Cabo"
  },
  {
    "id": "0e7b6d18-afe3-4c88-a066-672f8c091f8c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca Scott na máquina articulada (Preacher Curl Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "0ecfd882-44c9-4f87-8452-44ae6b89dbaf",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino declinado na máquina articulada",
    "equipment": "Máquina"
  },
  {
    "id": "108111b7-f249-4f57-b838-abd99b9da18a",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada cavalinho articulada com apoio no peito (T-Bar Row)",
    "equipment": "Máquina"
  },
  {
    "id": "110592fa-c4ba-4056-915f-cb2f7db17402",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CALVES",
    "name": "Panturrilha na máquina em pé (Standing Calf Raise)",
    "equipment": "Máquina"
  },
  {
    "id": "120b9770-5da0-450c-895f-f33020a8ad57",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação lateral unilateral na polia baixa (cabo)",
    "equipment": "Cabo"
  },
  {
    "id": "150a142d-bc14-4544-8a9e-b6a9969e2e49",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Elevação nórdica (Nordic Hamstring Curl)",
    "equipment": "Peso corporal"
  },
  {
    "id": "1839e051-1b9f-4986-86a3-4ad9cf5b976b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Levantamento terra convencional",
    "equipment": "Barra"
  },
  {
    "id": "1bf39560-c086-4a11-8842-96155898a2e0",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crossover na polia alta (foco inferior)",
    "equipment": "Cabo"
  },
  {
    "id": "1f5e2238-ad3b-4b12-bd01-f2f7693837fa",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca alternada com halteres sentado/em pé",
    "equipment": "Halter"
  },
  {
    "id": "1f9920bd-cfa1-4157-b1c4-673b03a4722b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Remo seco ergômetro (Concept 2)",
    "equipment": "Máquina"
  },
  {
    "id": "21add4fe-6a32-4f68-8331-3d5ef3472a61",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada baixa no cabo com triângulo (Seated Cable Row)",
    "equipment": "Cabo"
  },
  {
    "id": "24d008aa-b0e1-456f-b04d-0eadbcd95b9c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Leg Press 45° articulado tradicional",
    "equipment": "Máquina"
  },
  {
    "id": "29a25022-f9fc-48e6-96a7-ab9748aee90f",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Pulldown na polia alta com corda",
    "equipment": "Cabo"
  },
  {
    "id": "2aba7ad2-85a2-4272-a835-0bf61d64637c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca martelo com halteres (Bíceps e Braquial)",
    "equipment": "Halter"
  },
  {
    "id": "2ced77d4-9b47-48a6-a30e-36156f274b05",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps pulley no cabo com corda",
    "equipment": "Cabo"
  },
  {
    "id": "30256d72-bb5b-4a9c-b2c8-8242f6e1d4ed",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca bíceps dupla na polia alta (Double Biceps Cable Curl)",
    "equipment": "Cabo"
  },
  {
    "id": "31f5c3a6-6c35-4943-aa5b-e12df547b5fa",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Abdominal supra no banco declinado",
    "equipment": "Peso corporal"
  },
  {
    "id": "350adc32-b31e-4c82-8b44-96fe415fbf24",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps pulley no cabo com barra reta / barra V",
    "equipment": "Cabo"
  },
  {
    "id": "358484bb-2904-44cf-afb1-71e29de989fa",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Desenvolvimento de ombros na máquina articulada (Shoulder Press Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "35b7f09e-8901-4ea9-adf2-93991da87b3e",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Prancha frontal isométrica",
    "equipment": "Peso corporal"
  },
  {
    "id": "3b44c16c-8d2a-4ce6-9433-360008dfa8db",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação lateral na polia com crossover / cabo por trás",
    "equipment": "Cabo"
  },
  {
    "id": "3d997463-824e-4fb6-a5d7-5f44708063e0",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca direta com barra reta",
    "equipment": "Barra"
  },
  {
    "id": "3e08cbf5-6966-4071-8f32-b735f75babb2",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Good Morning com barra nas costas",
    "equipment": "Barra"
  },
  {
    "id": "412b84b7-374d-4451-bbda-0d9028ae76b0",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FOREARMS",
    "name": "Farmer walk com halteres pesados",
    "equipment": "Halter"
  },
  {
    "id": "4229c5d3-ad2a-42c8-b840-d8cd475dfa09",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Crucifixo invertido na polia alta (Face Pull com corda)",
    "equipment": "Cabo"
  },
  {
    "id": "44588051-b3e8-489d-a0bc-a9b0c8f76736",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crucifixo inclinado com halteres",
    "equipment": "Halter"
  },
  {
    "id": "44ee794c-2ad1-4af8-9e44-147000cefdec",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Stiff com halteres no banco / solo",
    "equipment": "Halter"
  },
  {
    "id": "473b9795-9292-495c-a15f-bd09066c8e97",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino reto com barra",
    "equipment": "Barra"
  },
  {
    "id": "48fb37ee-878b-485e-ab90-3855fef4a65b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Mergulho em barras paralelas (foco peitoral)",
    "equipment": "Peso corporal"
  },
  {
    "id": "4907d119-b0fb-4e33-899a-6a8cefb57f78",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Simulador de escada (Stairmaster)",
    "equipment": "Máquina"
  },
  {
    "id": "49103553-eb82-4562-af19-3b61e5662195",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CALVES",
    "name": "Panturrilha no Smith Machine com degrau / step",
    "equipment": "Máquina"
  },
  {
    "id": "4b785548-a0f7-4b35-a3fd-a5991afa2ed3",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Afundo estacionário no Smith Machine ou com halteres",
    "equipment": "Halter"
  },
  {
    "id": "50ff79fa-0a46-4b0c-917c-5f86f9546183",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Crucifixo invertido no voador / Pec Deck inverso",
    "equipment": "Máquina"
  },
  {
    "id": "51728c94-c9c8-46d1-abc0-521a73150b95",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Puxada frontal no pulley (pegada supinada)",
    "equipment": "Cabo"
  },
  {
    "id": "52f36f3c-5a72-4c32-91a2-6702df15d9d9",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Desenvolvimento militar em pé com barra (Overhead Press)",
    "equipment": "Barra"
  },
  {
    "id": "537fe347-945e-40d5-92e2-e5273b5162a1",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Agachamento frontal com barra (Front Squat)",
    "equipment": "Barra"
  },
  {
    "id": "5746dc48-0bb5-4bbc-905a-dc5599c98f5d",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Glúteo na máquina articulada (Glute Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "58684c7b-af77-4a5c-af63-9a11d91c386d",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Puxada frontal na máquina articulada (Lat Pulldown Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "58e44c3d-450f-4bdb-a701-bd07e86c2ff8",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação frontal na polia com corda/barra",
    "equipment": "Cabo"
  },
  {
    "id": "5a15978f-49dc-442d-ade5-cbedd4211ea0",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps coice na polia baixa",
    "equipment": "Cabo"
  },
  {
    "id": "623912fb-90f9-4775-bb53-7515639cc66d",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca concentrada unilateral com halter",
    "equipment": "Halter"
  },
  {
    "id": "625ea2a2-5540-4283-89d1-640ac9b0de33",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crucifixo no voador / Pec Deck",
    "equipment": "Máquina"
  },
  {
    "id": "63e95848-69c8-4268-9e00-dd7d22175ec3",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FULL_BODY",
    "name": "Kettlebell Swing",
    "equipment": "Halter"
  },
  {
    "id": "678b08d7-b167-4a0a-a1ac-85c71cef0d0b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FULL_BODY",
    "name": "Thruster com barra ou halteres",
    "equipment": "Barra"
  },
  {
    "id": "69e8c00d-9a49-4fe6-a8f1-41fffa618ca7",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CALVES",
    "name": "Panturrilha unilateral em degrau com halter",
    "equipment": "Halter"
  },
  {
    "id": "6b00e981-b93d-413e-9769-631b70f28c19",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Remada alta na polia baixa com barra reta",
    "equipment": "Cabo"
  },
  {
    "id": "6e479e2e-b9e2-428f-802b-7e41a612dc77",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Sissy Squat na máquina / livre",
    "equipment": "Máquina"
  },
  {
    "id": "6ea9c80b-9d1d-46c2-828c-d8774d43ed77",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Bicicleta ergométrica / Spinning",
    "equipment": "Máquina"
  },
  {
    "id": "7119812f-d3c5-4777-a7ab-bf723d2676a4",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada baixa no cabo com barra romana (pegada neutra aberta)",
    "equipment": "Cabo"
  },
  {
    "id": "714f1ad3-5107-466b-83e9-d84f6c8736c4",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Pulldown na polia alta com barra reta",
    "equipment": "Cabo"
  },
  {
    "id": "72293068-554f-4446-8c72-4dddc15c5629",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Extensão lombar no banco romano / hiperextensão",
    "equipment": "Peso corporal"
  },
  {
    "id": "724baa09-e370-4ff2-99c9-7089057f06c8",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FOREARMS",
    "name": "Rosca punho inversa com barra (Extensão de punho)",
    "equipment": "Barra"
  },
  {
    "id": "726cd69e-a4ea-4b99-b824-b13878288792",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Desenvolvimento sentado com halteres",
    "equipment": "Halter"
  },
  {
    "id": "7536b3bf-e60b-4ccb-9e94-0b04ecadf2bb",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Puxada frontal no pulley (triângulo / pegada neutra)",
    "equipment": "Cabo"
  },
  {
    "id": "76260701-bfa6-4281-9c0f-6622b8749aeb",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação lateral com halteres em pé",
    "equipment": "Halter"
  },
  {
    "id": "78f94760-210c-46b7-bb45-49620de4107c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino reto na máquina articulada (Chest Press)",
    "equipment": "Máquina"
  },
  {
    "id": "79de808e-144c-4f1b-b72c-6d2abaab5d58",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Esteira corrida moderada / intensa",
    "equipment": "Máquina"
  },
  {
    "id": "80bc5dda-fe5d-436c-85bf-9f1f3f631925",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps testa no cabo com corda ou barra",
    "equipment": "Cabo"
  },
  {
    "id": "819deb0f-34a4-427a-957d-ef672a2b99f5",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Agachamento livre com barra nas costas (Back Squat)",
    "equipment": "Barra"
  },
  {
    "id": "81cebef1-d360-4371-b105-3ad820892509",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Avanço / Passada caminhando com halteres",
    "equipment": "Halter"
  },
  {
    "id": "824f4522-517d-4581-96a6-38ddbc36916a",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FOREARMS",
    "name": "Rosca inversa com barra W",
    "equipment": "Barra"
  },
  {
    "id": "862e1bef-a481-4e9c-8db7-dde61370b538",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino declinado com barra",
    "equipment": "Barra"
  },
  {
    "id": "87af4969-5a0d-4195-93bf-c4eb11967b89",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino inclinado com barra",
    "equipment": "Barra"
  },
  {
    "id": "87d79113-1114-4702-9aab-a4fe0d647239",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Barra fixa pronada (Pull-up)",
    "equipment": "Peso corporal"
  },
  {
    "id": "89f47fca-8116-44b3-bb77-c06811d8136b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps pulley pegada invertida (unilateral/bilateral)",
    "equipment": "Cabo"
  },
  {
    "id": "8a568222-59cd-4b1c-a68f-3e36cdff4800",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Step-up na caixa alta com halteres",
    "equipment": "Halter"
  },
  {
    "id": "8e4b985c-0c7b-4045-9ee3-61a2c58cee91",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino inclinado na máquina articulada (Incline Chest Press)",
    "equipment": "Máquina"
  },
  {
    "id": "95891436-4146-4718-a87d-f5c6fa72fc5c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Cadeira abdutora com tronco inclinado / ereto",
    "equipment": "Máquina"
  },
  {
    "id": "95d110cc-e3bf-4f3d-8343-ce2e28d127e7",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Stomach Vacuum (Controle transverso do abdômen)",
    "equipment": "Peso corporal"
  },
  {
    "id": "9738316c-85a4-4cd3-8e26-ffd97dd11305",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação lateral na máquina articulada",
    "equipment": "Máquina"
  },
  {
    "id": "98655f7a-445a-4992-b524-858776d1a0c0",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Flexora vertical em pé unilateral (Standing Leg Curl)",
    "equipment": "Máquina"
  },
  {
    "id": "9d09838d-4c6a-49cb-bcc6-b88a7cfd011c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Levantamento terra romeno (RDL com barra)",
    "equipment": "Barra"
  },
  {
    "id": "9d4e33bd-4fc4-49a7-ae64-9c975c31f872",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca direta com barra W",
    "equipment": "Barra"
  },
  {
    "id": "9f92eb34-9aba-4a2e-a16d-60d538e26e92",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Barra fixa com auxílio de elástico/graviton",
    "equipment": "Máquina"
  },
  {
    "id": "a2abd6b0-1faa-4846-b313-e0300bcc9266",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Cadeira adutora (foco adutores de coxa)",
    "equipment": "Máquina"
  },
  {
    "id": "a635716b-11ca-44c1-b3d0-0bbd593e4b45",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada unilateral com halter (Serrote no banco)",
    "equipment": "Halter"
  },
  {
    "id": "a74075f6-dee9-4f96-9dec-52ce8701b1bc",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps mergulho na máquina articulada (Dip Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "ac3a2127-3713-4458-a3c3-b0370e78eff8",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Desenvolvimento no Smith Machine",
    "equipment": "Máquina"
  },
  {
    "id": "ac74f8f7-3fb3-44ce-b17f-31e3234960e2",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Supino com pegada fechada (Close-Grip Bench Press)",
    "equipment": "Barra"
  },
  {
    "id": "add26764-dfca-4636-abc7-33c40f0e2451",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crossover na polia média (foco medial)",
    "equipment": "Cabo"
  },
  {
    "id": "af980e27-6807-4e5e-bce4-40adc47fc15c",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Abdominal Crunch tradicional no solo",
    "equipment": "Peso corporal"
  },
  {
    "id": "b04e0745-0877-41cc-8830-3400c3ef6ded",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps testa com barra W no banco reto",
    "equipment": "Barra"
  },
  {
    "id": "b2869962-f513-47e0-9a1b-cb6a7e925482",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Desenvolvimento Arnold com halteres",
    "equipment": "Halter"
  },
  {
    "id": "b5964c01-81b6-4b90-9ba3-87bcd9b157b8",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crucifixo reto com halteres",
    "equipment": "Halter"
  },
  {
    "id": "b9fc0767-c5e2-4bc1-a569-def7002ff312",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Agachamento no Smith Machine",
    "equipment": "Máquina"
  },
  {
    "id": "bcd6c2ec-0650-42be-8352-acddeba6949f",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca no banco 45° inclinado com halteres",
    "equipment": "Halter"
  },
  {
    "id": "bd713dd2-d66f-4d57-9dde-eac0fe9f98ec",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca direta na polia baixa com barra reta/W",
    "equipment": "Cabo"
  },
  {
    "id": "beab809d-427a-4bb9-862a-0f928e1b6e93",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Mesa flexora deitada (Lying Leg Curl)",
    "equipment": "Máquina"
  },
  {
    "id": "c0cd02ea-b7fd-4cb2-9f99-d3a1e4bba63f",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Agachamento búlgaro com halteres no banco",
    "equipment": "Halter"
  },
  {
    "id": "c73ec554-fcc5-41b6-8b43-49d99638aa9d",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Pular corda (Speed rope)",
    "equipment": "Corda"
  },
  {
    "id": "cb823091-3e0f-4977-a84d-58577390309b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Roda abdominal no solo (Ab Wheel Rollout)",
    "equipment": "Roda"
  },
  {
    "id": "cb8f844e-5adc-4303-aa70-eeb8e8fa6aa6",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps francês unilateral na polia / cabo",
    "equipment": "Cabo"
  },
  {
    "id": "ce5d1441-01bd-4304-b15a-ad7ba29accbc",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FULL_BODY",
    "name": "Clean and Press com barra",
    "equipment": "Barra"
  },
  {
    "id": "d32ae34a-019c-4b35-83f5-50084e3f6ffb",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Leg Press horizontal com placas",
    "equipment": "Máquina"
  },
  {
    "id": "d363b068-3834-4505-98f2-a01be23878d9",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Encolhimento de ombros na máquina Smith / articulada",
    "equipment": "Máquina"
  },
  {
    "id": "d44356d0-f999-4a2f-bd31-03911ad250b3",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Encolhimento com halteres (Trapézio)",
    "equipment": "Halter"
  },
  {
    "id": "d59f3237-8ea5-4ec0-a94a-48e8bc84242e",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "FULL_BODY",
    "name": "Burpee tradicional",
    "equipment": "Peso corporal"
  },
  {
    "id": "db2ae988-5098-4c7b-96fc-b298d8d51290",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Remada curvada com barra livre",
    "equipment": "Barra"
  },
  {
    "id": "dbcd4bfd-aa8d-40f7-8c3e-aac405a28e2a",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Mergulho em barras paralelas com peso corporal / Graviton",
    "equipment": "Máquina"
  },
  {
    "id": "dcfe557c-70ed-4fca-8185-8f20330fba70",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "HAMSTRINGS",
    "name": "Stiff com barra (joelhos semiflexionados)",
    "equipment": "Barra"
  },
  {
    "id": "de38213d-e188-4693-aeb4-1791d092195e",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Abdominal na máquina articulada (Abdominal Machine)",
    "equipment": "Máquina"
  },
  {
    "id": "de524896-471d-4e5a-9645-a04e30afa2a7",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Crossover na polia baixa (foco superior/clavicular)",
    "equipment": "Cabo"
  },
  {
    "id": "dfb3123d-3317-4b70-9880-fd1df9920a77",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino reto com halteres",
    "equipment": "Halter"
  },
  {
    "id": "e004ced4-333f-466a-8b75-eba32f668639",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Flexão de braço tradicional",
    "equipment": "Peso corporal"
  },
  {
    "id": "e40861b1-ebe9-49aa-97e6-7d4db7126112",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Agachamento sumô no Smith ou com halter na caixa",
    "equipment": "Halter"
  },
  {
    "id": "e669c5c1-8c2a-48be-bdfd-75340277e203",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "QUADRICEPS",
    "name": "Agachamento no Hack Machine articulado (Hack Squat)",
    "equipment": "Máquina"
  },
  {
    "id": "e7f71470-3c46-4ac0-a168-332c4e926198",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "ABS",
    "name": "Abdominal na polia alta ajoelhado com corda (Cable Crunch)",
    "equipment": "Cabo"
  },
  {
    "id": "e8b41bb9-c31a-473d-9bc3-ad9a1dc27d75",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "TRICEPS",
    "name": "Tríceps francês bilateral na polia com corda",
    "equipment": "Cabo"
  },
  {
    "id": "eea4f3da-4a27-4365-b953-86e01d933f3b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Glúteo na polia baixa com caneleira / tornozeleira (Kickback)",
    "equipment": "Cabo"
  },
  {
    "id": "eefbe068-610f-445f-a26a-d1eaee67d330",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BACK",
    "name": "Puxada frontal no pulley (pegada aberta pronada)",
    "equipment": "Cabo"
  },
  {
    "id": "ef484b18-5e0f-4c37-acf0-791b1f4d8ee3",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Elíptico / Cross trainer",
    "equipment": "Máquina"
  },
  {
    "id": "f15bfd8a-6f97-4dc5-b97a-532f43bd4d3b",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "GLUTES",
    "name": "Elevação pélvica livre com barra e acolchoado (Hip Thrust)",
    "equipment": "Barra"
  },
  {
    "id": "f3a0d88c-620f-4eac-b102-365efb329caf",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CARDIO",
    "name": "Esteira caminhada inclinada (12-3-30)",
    "equipment": "Máquina"
  },
  {
    "id": "f50cbd63-accd-487b-a708-fab48ec79e75",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CALVES",
    "name": "Panturrilha na máquina sentado (Gêmeos sentado / Sóleo)",
    "equipment": "Máquina"
  },
  {
    "id": "f78dd3f5-9b1e-40cc-bc81-212d05db8bda",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CHEST",
    "name": "Supino inclinado com halteres",
    "equipment": "Halter"
  },
  {
    "id": "f9fc4d5b-5d94-4122-a776-3d3d66c4b04d",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "CALVES",
    "name": "Panturrilha no Leg Press 45°",
    "equipment": "Máquina"
  },
  {
    "id": "fb686d9b-9cb9-4edf-91d6-3a925fc26281",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Crucifixo invertido com halteres no banco inclinado",
    "equipment": "Halter"
  },
  {
    "id": "fe0ec640-698d-4220-b557-22b54538f189",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "BICEPS",
    "name": "Rosca Spider no banco inclinado com halteres",
    "equipment": "Halter"
  },
  {
    "id": "ffc9baf5-9d14-4f6c-85b2-8ef3da9c8128",
    "createdAt": "2026-09-01T18:21:11.316Z",
    "muscleGroup": "SHOULDERS",
    "name": "Elevação frontal com halteres alternada",
    "equipment": "Halter"
  }
];
