export const kumaPageFixture = {
  incident: null,
  publicGroupList: [
    {
      monitorList: [
        { id: 1, name: "Viper Hub" },
        { id: 8, name: "ViperCapture" },
        { id: 14, name: "ViperCapture API Route" },
        { id: 15, name: "ViperCapture API Functional" },
        { id: 10, name: "Turtle Cave Database Health" },
        { id: 5, name: "QuickRunLab" },
        { id: 16, name: "QuickRunLab API" },
      ],
    },
  ],
};

export const kumaHeartbeatFixture = {
  heartbeatList: Object.fromEntries(
    [1, 8, 14, 15, 10, 5, 16].map((id) => [
      String(id),
      [
        { status: 1, time: "2026-07-25 22:58:00" },
        { status: 1, time: "2026-07-25 22:59:00" },
      ],
    ]),
  ),
  uptimeList: Object.fromEntries(
    [1, 8, 14, 15, 10, 5, 16].map((id) => [`${id}_24`, 1]),
  ),
};

