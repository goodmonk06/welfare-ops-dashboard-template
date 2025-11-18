import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.shift.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.resident.deleteMany();

  // Create Residents
  console.log("Creating residents...");
  const residents = await Promise.all([
    prisma.resident.create({
      data: {
        name: "山田 太郎",
        age: 75,
        roomNumber: "101",
        careLevel: 3,
        medicalInfo: "高血圧症、糖尿病の既往歴あり",
        status: "active",
      },
    }),
    prisma.resident.create({
      data: {
        name: "佐藤 花子",
        age: 82,
        roomNumber: "102",
        careLevel: 4,
        medicalInfo: "認知症、軽度の心疾患",
        status: "active",
      },
    }),
    prisma.resident.create({
      data: {
        name: "鈴木 一郎",
        age: 68,
        roomNumber: "103",
        careLevel: 2,
        medicalInfo: "腰痛症、リハビリ中",
        status: "active",
      },
    }),
    prisma.resident.create({
      data: {
        name: "田中 美咲",
        age: 79,
        roomNumber: "104",
        careLevel: 5,
        medicalInfo: "脳梗塞後遺症、要介助",
        status: "active",
      },
    }),
    prisma.resident.create({
      data: {
        name: "高橋 健太",
        age: 71,
        roomNumber: "105",
        careLevel: 1,
        medicalInfo: "特記事項なし",
        status: "active",
      },
    }),
  ]);

  // Create Staff
  console.log("Creating staff members...");
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        name: "中村 健",
        role: "施設長",
        email: "nakamura@example.com",
        phoneNumber: "090-1234-5678",
        hireDate: new Date("2020-04-01"),
        status: "active",
      },
    }),
    prisma.staff.create({
      data: {
        name: "伊藤 美香",
        role: "看護師",
        email: "ito@example.com",
        phoneNumber: "090-2345-6789",
        hireDate: new Date("2021-06-15"),
        status: "active",
      },
    }),
    prisma.staff.create({
      data: {
        name: "渡辺 大輔",
        role: "介護士",
        email: "watanabe@example.com",
        phoneNumber: "090-3456-7890",
        hireDate: new Date("2022-01-10"),
        status: "active",
      },
    }),
    prisma.staff.create({
      data: {
        name: "小林 さくら",
        role: "介護士",
        email: "kobayashi@example.com",
        phoneNumber: "090-4567-8901",
        hireDate: new Date("2022-03-20"),
        status: "active",
      },
    }),
    prisma.staff.create({
      data: {
        name: "加藤 雄介",
        role: "ケアマネージャー",
        email: "kato@example.com",
        phoneNumber: "090-5678-9012",
        hireDate: new Date("2021-09-01"),
        status: "active",
      },
    }),
  ]);

  // Create Shifts for this month
  console.log("Creating shifts...");
  const today = new Date();
  const shifts = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);

    // Early shift (8:00-16:00)
    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[1].id, // Nurse
          date: date,
          startTime: "08:00",
          endTime: "16:00",
          shiftType: "早番",
        },
      })
    );

    // Day shift (9:00-17:00)
    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[2].id, // Care worker 1
          date: date,
          startTime: "09:00",
          endTime: "17:00",
          shiftType: "日勤",
        },
      })
    );

    // Late shift (13:00-21:00)
    shifts.push(
      prisma.shift.create({
        data: {
          staffId: staff[3].id, // Care worker 2
          date: date,
          startTime: "13:00",
          endTime: "21:00",
          shiftType: "遅番",
        },
      })
    );

    // Night shift (21:00-08:00)
    if (day % 3 === 0) {
      shifts.push(
        prisma.shift.create({
          data: {
            staffId: staff[2].id,
            date: date,
            startTime: "21:00",
            endTime: "08:00",
            shiftType: "夜勤",
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
          "入所者が居室内で転倒。幸い外傷なし。歩行時の見守りを強化する。",
        occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        severity: "medium",
        category: "転倒",
        reportedBy: "渡辺 大輔",
        status: "investigating",
      },
    }),
    prisma.incident.create({
      data: {
        title: "服薬時のヒヤリハット",
        description:
          "服薬準備時に別の入所者の薬を配薬しそうになった。再確認により未然に防げた。ダブルチェック体制を徹底する。",
        occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        severity: "high",
        category: "誤薬",
        reportedBy: "伊藤 美香",
        status: "resolved",
      },
    }),
    prisma.incident.create({
      data: {
        title: "食事介助中の誤嚥リスク",
        description:
          "食事介助中に入所者が咳き込み。水分でむせた可能性。とろみ剤の使用を検討。",
        occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        severity: "medium",
        category: "その他",
        reportedBy: "小林 さくら",
        status: "reported",
      },
    }),
    prisma.incident.create({
      data: {
        title: "エレベーター内での転倒",
        description:
          "移動時、エレベーター内で車椅子が動き転倒しそうになった。ブレーキの確認を徹底。",
        occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        severity: "low",
        category: "転倒",
        reportedBy: "渡辺 大輔",
        status: "resolved",
      },
    }),
  ]);

  console.log("✅ Seeding completed successfully!");
  console.log(`Created ${residents.length} residents`);
  console.log(`Created ${staff.length} staff members`);
  console.log(`Created ${shifts.length} shifts`);
  console.log("Created 4 incidents");
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
