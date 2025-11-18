import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with Phase 3 comprehensive data...");

  // Clear existing data in correct order (respecting foreign keys)
  console.log("Clearing existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.careAssessment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.resident.deleteMany();

  // Create Staff first
  console.log("Creating staff members...");
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: "中村 健",
        role: "施設長",
        department: "管理部",
        email: "nakamura@example.com",
        phoneNumber: "090-1234-5678",
        hireDate: new Date("2020-04-01"),
        status: "active",
        certifications: ["介護福祉士", "社会福祉士"],
        tags: ["管理職"],
      },
    }),
    prisma.staff.create({
      data: {
        name: "伊藤 美香",
        role: "看護師",
        department: "医療部",
        email: "ito@example.com",
        phoneNumber: "090-2345-6789",
        hireDate: new Date("2021-06-15"),
        status: "active",
        certifications: ["正看護師", "認知症ケア専門士"],
        tags: ["医療", "リーダー"],
      },
    }),
    prisma.staff.create({
      data: {
        name: "渡辺 大輔",
        role: "介護士",
        department: "介護部",
        email: "watanabe@example.com",
        phoneNumber: "090-3456-7890",
        hireDate: new Date("2022-01-10"),
        status: "active",
        certifications: ["介護福祉士"],
        tags: ["夜勤対応可"],
      },
    }),
    prisma.staff.create({
      data: {
        name: "小林 さくら",
        role: "介護士",
        department: "介護部",
        email: "kobayashi@example.com",
        phoneNumber: "090-4567-8901",
        hireDate: new Date("2022-03-20"),
        status: "active",
        certifications: ["介護職員初任者研修"],
        tags: ["新人"],
      },
    }),
    prisma.staff.create({
      data: {
        name: "加藤 雄介",
        role: "ケアマネージャー",
        department: "相談支援部",
        email: "kato@example.com",
        phoneNumber: "090-5678-9012",
        hireDate: new Date("2021-09-01"),
        status: "active",
        certifications: ["介護支援専門員", "社会福祉士"],
        tags: ["ケアプラン作成"],
      },
    }),
    prisma.staff.create({
      data: {
        name: "山本 優子",
        role: "栄養士",
        department: "栄養管理部",
        email: "yamamoto@example.com",
        phoneNumber: "090-6789-0123",
        hireDate: new Date("2021-07-01"),
        status: "active",
        certifications: ["管理栄養士"],
        tags: ["食事管理"],
      },
    }),
  ]);

  // Create Residents
  console.log("Creating residents...");
  const residents = await Promise.all([
    prisma.resident.create({
      data: {
        name: "山田 太郎",
        age: 75,
        roomNumber: "101",
        careLevel: 3,
        medicalInfo: "高血圧症、糖尿病の既往歴あり。朝食後に服薬が必要。",
        status: "active",
        emergencyContact: "山田 次郎（長男）",
        emergencyPhone: "080-1111-2222",
        primaryCareWorkerId: staff[2].id,
        tags: ["糖尿病", "高血圧"],
      },
    }),
    prisma.resident.create({
      data: {
        name: "佐藤 花子",
        age: 82,
        roomNumber: "102",
        careLevel: 4,
        medicalInfo: "アルツハイマー型認知症、軽度の心疾患。見守りが常時必要。",
        status: "active",
        emergencyContact: "佐藤 美樹（娘）",
        emergencyPhone: "080-2222-3333",
        primaryCareWorkerId: staff[3].id,
        tags: ["認知症", "要見守り"],
      },
    }),
    prisma.resident.create({
      data: {
        name: "鈴木 一郎",
        age: 68,
        roomNumber: "103",
        careLevel: 2,
        medicalInfo: "腰痛症でリハビリ中。週3回の理学療法を実施。",
        status: "active",
        emergencyContact: "鈴木 和子（妻）",
        emergencyPhone: "080-3333-4444",
        primaryCareWorkerId: staff[2].id,
        tags: ["リハビリ中"],
      },
    }),
    prisma.resident.create({
      data: {
        name: "田中 美咲",
        age: 79,
        roomNumber: "104",
        careLevel: 5,
        medicalInfo: "脳梗塞後遺症により左半身麻痺。全介助が必要。",
        status: "active",
        emergencyContact: "田中 健一（息子）",
        emergencyPhone: "080-4444-5555",
        primaryCareWorkerId: staff[1].id,
        tags: ["全介助", "要医療"],
      },
    }),
    prisma.resident.create({
      data: {
        name: "高橋 健太",
        age: 71,
        roomNumber: "105",
        careLevel: 1,
        medicalInfo: "特記事項なし。自立度高い。",
        status: "active",
        emergencyContact: "高橋 由美（娘）",
        emergencyPhone: "080-5555-6666",
        primaryCareWorkerId: staff[3].id,
        tags: ["自立"],
      },
    }),
    prisma.resident.create({
      data: {
        name: "吉田 明子",
        age: 85,
        roomNumber: "106",
        careLevel: 3,
        medicalInfo: "慢性腎不全で週2回の透析が必要。",
        status: "active",
        emergencyContact: "吉田 大介（孫）",
        emergencyPhone: "080-6666-7777",
        primaryCareWorkerId: staff[1].id,
        tags: ["透析", "要医療"],
      },
    }),
  ]);

  // Create Shifts
  console.log("Creating shifts...");
  const today = new Date();
  const shifts = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);

    // Nurse - early shift
    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[1].id,
          date,
          startTime: "08:00",
          endTime: "16:00",
          shiftType: "早番",
          status: day < today.getDate() ? "completed" : "scheduled",
          tags: ["医療対応"],
        },
      })
    );

    // Care workers - various shifts
    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[2].id,
          date,
          startTime: "09:00",
          endTime: "17:00",
          shiftType: "日勤",
          status: day < today.getDate() ? "completed" : "scheduled",
        },
      })
    );

    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[3].id,
          date,
          startTime: "13:00",
          endTime: "21:00",
          shiftType: "遅番",
          status: day < today.getDate() ? "completed" : "scheduled",
        },
      })
    );

    // Night shifts (every other day)
    if (day % 2 === 0) {
      shifts.push(
        prisma.shift.create({
          data: {
            staffId: staff[2].id,
            date,
            startTime: "21:00",
            endTime: "08:00",
            shiftType: "夜勤",
            status: day < today.getDate() ? "completed" : "scheduled",
            tags: ["夜間対応"],
          },
        })
      );
    }
  }

  await Promise.all(shifts);

  // Create Incidents
  console.log("Creating incidents...");
  await Promise.all([
    prisma.incident.create({
      data: {
        title: "居室内での転倒",
        description:
          "入所者が夜間トイレに行く際、ベッドから立ち上がった直後に転倒。幸い外傷なし。歩行時の見守りを強化する。",
        occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        severity: "medium",
        category: "転倒",
        reportedById: staff[2].id,
        residentId: residents[0].id,
        location: "101号室",
        witnesses: ["渡辺 大輔"],
        actionsTaken: "看護師による診察実施。外傷なし。バイタル確認OK。",
        preventiveMeasures: "ナースコールの使用を再指導。夜間センサーマット設置を検討。",
        status: "investigating",
        tags: ["転倒", "夜間"],
      },
    }),
    prisma.incident.create({
      data: {
        title: "服薬時のヒヤリハット",
        description:
          "服薬準備時に別の入所者の薬を配薬しそうになった。再確認により未然に防げた。ダブルチェック体制を徹底する。",
        occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        severity: "high",
        category: "誤薬",
        reportedById: staff[1].id,
        location: "食堂",
        witnesses: ["伊藤 美香", "小林 さくら"],
        actionsTaken: "服薬手順の再確認。スタッフ全員に注意喚起。",
        preventiveMeasures: "服薬カート導入を検討。必ず2名でダブルチェック実施。",
        status: "resolved",
        tags: ["誤薬防止", "ヒヤリハット"],
      },
    }),
    prisma.incident.create({
      data: {
        title: "食事介助中の誤嚥リスク",
        description:
          "食事介助中に入所者が咳き込み。水分でむせた可能性。",
        occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        severity: "medium",
        category: "その他",
        reportedById: staff[3].id,
        residentId: residents[1].id,
        location: "食堂",
        witnesses: ["小林 さくら"],
        actionsTaken: "食事を一旦中止。様子観察。バイタル安定。",
        preventiveMeasures: "とろみ剤の使用を検討。食事形態の再評価を実施。",
        status: "reported",
        tags: ["誤嚥リスク"],
      },
    }),
    prisma.incident.create({
      data: {
        title: "認知症による他入所者への暴言",
        description: "認知症の症状により、他の入所者に対して暴言があった。",
        occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        severity: "low",
        category: "その他",
        reportedById: staff[2].id,
        residentId: residents[1].id,
        location: "共用スペース",
        witnesses: ["渡辺 大輔", "小林 さくら"],
        actionsTaken: "落ち着いていただくまで個別対応。両入所者に謝罪と説明。",
        preventiveMeasures: "認知症ケアの再確認。環境調整を実施。",
        status: "resolved",
        tags: ["認知症", "BPSD"],
      },
    }),
  ]);

  // Create Medications
  console.log("Creating medications...");
  await Promise.all([
    prisma.medication.create({
      data: {
        residentId: residents[0].id,
        name: "アムロジピン",
        dosage: "5mg",
        frequency: "1日1回 朝食後",
        route: "経口",
        prescribedBy: "田中医師",
        purpose: "高血圧症の治療",
        status: "active",
        tags: ["降圧薬"],
      },
    }),
    prisma.medication.create({
      data: {
        residentId: residents[0].id,
        name: "メトホルミン",
        dosage: "500mg",
        frequency: "1日2回 朝夕食後",
        route: "経口",
        prescribedBy: "田中医師",
        purpose: "糖尿病の治療",
        status: "active",
        tags: ["糖尿病薬"],
      },
    }),
    prisma.medication.create({
      data: {
        residentId: residents[1].id,
        name: "ドネペジル",
        dosage: "5mg",
        frequency: "1日1回 就寝前",
        route: "経口",
        prescribedBy: "佐藤医師",
        purpose: "アルツハイマー型認知症の進行抑制",
        status: "active",
        tags: ["認知症薬"],
      },
    }),
  ]);

  // Create Notes
  console.log("Creating notes...");
  await Promise.all([
    prisma.note.create({
      data: {
        content: "本日の朝食は全量摂取。体調良好。リハビリも意欲的に参加されました。",
        type: "general",
        residentId: residents[2].id,
        authorId: staff[2].id,
        shift: "日勤",
        tags: ["食事", "リハビリ"],
      },
    }),
    prisma.note.create({
      data: {
        content: "夜間2回トイレ誘導実施。転倒なく無事に戻られました。センサーマット反応良好。",
        type: "handover",
        residentId: residents[0].id,
        authorId: staff[2].id,
        shift: "夜勤",
        isPinned: true,
        tags: ["夜間対応", "転倒予防"],
      },
    }),
    prisma.note.create({
      data: {
        content: "家族面会あり。状態について説明。次回ケアプラン見直しについて相談。",
        type: "important",
        residentId: residents[3].id,
        authorId: staff[4].id,
        isPinned: true,
        tags: ["家族対応", "ケアプラン"],
      },
    }),
  ]);

  // Create Care Assessments
  console.log("Creating care assessments...");
  await Promise.all([
    prisma.careAssessment.create({
      data: {
        residentId: residents[0].id,
        assessmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        physicalHealth: 7,
        mentalHealth: 8,
        mobilityLevel: 3,
        nutritionStatus: "良好",
        sleepQuality: "良好",
        socialEngagement: "積極的",
        painLevel: 2,
        findings: "全体的に安定。血糖値コントロール良好。",
        recommendations: "現状の介護プラン継続。定期的な血糖値モニタリング継続。",
        nextReviewDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        status: "finalized",
        tags: ["定期評価"],
      },
    }),
    prisma.careAssessment.create({
      data: {
        residentId: residents[1].id,
        assessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        physicalHealth: 6,
        mentalHealth: 4,
        mobilityLevel: 2,
        nutritionStatus: "やや不良",
        sleepQuality: "不安定",
        socialEngagement: "消極的",
        painLevel: 1,
        findings: "認知症症状の進行あり。BPSDの出現頻度増加。",
        recommendations: "認知症ケアの強化。家族との連携強化。環境調整を実施。",
        nextReviewDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "finalized",
        tags: ["認知症", "要注意"],
      },
    }),
  ]);

  // Create Tasks
  console.log("Creating tasks...");
  await Promise.all([
    prisma.task.create({
      data: {
        title: "山田太郎様 ケアプラン見直し",
        description: "3ヶ月ごとの定期見直し時期。家族との面談予定を調整してください。",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: "high",
        status: "pending",
        assignedToId: staff[4].id,
        category: "assessment_due",
        tags: ["ケアプラン"],
      },
    }),
    prisma.task.create({
      data: {
        title: "佐藤花子様 薬剤師との相談",
        description: "認知症薬の効果と副作用について薬剤師と相談。",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: "medium",
        status: "in_progress",
        assignedToId: staff[1].id,
        category: "medication_review",
        tags: ["薬剤相談"],
      },
    }),
    prisma.task.create({
      data: {
        title: "全入所者の防災訓練実施",
        description: "年2回実施義務。避難経路確認と実地訓練を実施してください。",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: "high",
        status: "pending",
        assignedToId: staff[0].id,
        category: "follow_up",
        tags: ["防災", "法定義務"],
      },
    }),
    prisma.task.create({
      data: {
        title: "転倒予防カンファレンス",
        description: "最近の転倒事例について多職種で検討。再発防止策を協議。",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: "urgent",
        status: "pending",
        assignedToId: staff[0].id,
        recurring: false,
        tags: ["転倒予防", "カンファレンス"],
      },
    }),
  ]);

  console.log("✅ Phase 3 seeding completed successfully!");
  console.log(`Created ${residents.length} residents`);
  console.log(`Created ${staff.length} staff members`);
  console.log(`Created ${shifts.length} shifts`);
  console.log("Created 4 incidents");
  console.log("Created 3 medications");
  console.log("Created 3 notes");
  console.log("Created 2 care assessments");
  console.log("Created 4 tasks");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
