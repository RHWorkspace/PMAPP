# Flow Diagram Modul Project Management

---

## Modul: Project

```mermaid
flowchart TD
    A[Create Project] --> B[Set Timeline]
    B --> C[Assign Team]
    C --> D[Add Application]
    D --> E[Add Module]
    E --> F[Define Sprints]
    F --> G[Define Tasks]
    G --> H[Monitor Progress]
    H --> I{Progress Satisfactory?}
    I -- Yes --> J[Project Completion]
    I -- No --> K[Revise Plan]
    K --> H
    A --> L[Cancel Project]
```

---

## Modul: Team

```mermaid
flowchart TD
    A[Create Team] --> B[Add Members]
    B --> C[Assign Roles to Members]
    C --> D[Assign Team to Project]
    D --> E[Edit Team Info]
    E --> F[Remove Member]
    F --> B
```

---

## Modul: Application

```mermaid
flowchart TD
    A[Create Application] --> B[Assign to Project]
    B --> C[Add Module]
    C --> D[Edit Application Info]
    D --> E[Remove Application]
```

---

## Modul: Module

```mermaid
flowchart TD
    A[Create Module] --> B[Assign to Application]
    B --> C[Edit Module Info]
    C --> D[Remove Module]
```

---

## Modul: Sprint

```mermaid
flowchart TD
    A[Create Sprint] --> B[Assign to Project]
    B --> C[Set Sprint Timeline]
    C --> D[Add Tasks to Sprint]
    D --> E[Monitor Sprint Progress]
    E --> F{Sprint Complete?}
    F -- Yes --> G[Close Sprint]
    F -- No --> H[Revise Sprint Plan]
    H --> E
```

---

## Modul: Task

```mermaid
flowchart TD
    A[Create Task] --> B{Parent Task?}
    B -- Yes --> C[Validate Subtask Estimate & Date]
    C --> D[Save as Subtask]
    D --> E[Update Parent Progress & Status]
    D --> I[Task In Progress]
    D --> N[Cancel Task]
    B -- No --> F[Save as Parent Task]
    F --> G[Add Subtask?]
    G -- Yes --> H[Create Subtask]
    H --> C
    G -- No --> I
    F --> I
    I --> J[Task Review]
    J --> K{Task Approved?}
    K -- Yes --> L[Task Done]
    K -- No --> M[Revise Task]
    M --> I
```

---

## Modul: User

```mermaid
flowchart TD
    A[Register User] --> B[Assign Role]
    B --> C[Assign Position]
    C --> D[Assign Division]
    D --> E[User Login]
    E --> F[Access Modules]
    F --> G[Logout]
    E --> H[Forgot Password]
    H --> I[Reset Password]
    I --> E
```

---

## Modul: Role

```mermaid
flowchart TD
    A[Create Role] --> B[Set Permissions]
    B --> C[Assign Role to User]
    C --> D[Edit Role]
    D --> E[Delete Role]
```

---

## Modul: Position

```mermaid
flowchart TD
    A[Create Position] --> B[Assign to User]
    B --> C[Edit Position]
    C --> D[Delete Position]
```

---

## Modul: Division

```mermaid
flowchart TD
    A[Create Division] --> B[Assign to User]
    B --> C[Edit Division]
    C --> D[Delete Division]
```