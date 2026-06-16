import { Separator } from "@/components/ui/separator";

export interface MonsterStatBlockProps {
  title: string;
  subtitle?: string;
  "armor-class"?: string;
  "hit-points"?: string;
  speed?: string;
  str?: string;
  dex?: string;
  con?: string;
  int?: string;
  wis?: string;
  cha?: string;
  "saving-throws"?: string;
  skills?: string;
  "damage-vulnerabilities"?: string;
  "damage-resistances"?: string;
  "damage-immunities"?: string;
  "condition-immunities"?: string;
  senses?: string;
  languages?: string;
  challenge?: string;
}

export function MonsterStatBlock(props: MonsterStatBlockProps) {
  const {
    title,
    subtitle,
    "armor-class": armorClass,
    "hit-points": hitPoints,
    speed,
    str,
    dex,
    con,
    int,
    wis,
    cha,
    "saving-throws": savingThrows,
    skills,
    "damage-vulnerabilities": damageVulnerabilities,
    "damage-resistances": damageResistances,
    "damage-immunities": damageImmunities,
    "condition-immunities": conditionImmunities,
    senses,
    languages,
    challenge,
  } = props;

  return (
    <div className="my-4 rounded-lg border-2 border-red-800 bg-amber-50 p-4 dark:bg-amber-950/20">
      <h3 className="text-xl font-bold text-red-800 dark:text-red-400">{title}</h3>
      {subtitle && <p className="italic text-muted-foreground">{subtitle}</p>}

      <Separator className="my-2 bg-red-800" />

      <div className="space-y-1 text-sm">
        {armorClass && <p><strong>Zbroj:</strong> {armorClass}</p>}
        {hitPoints && <p><strong>Výdrže:</strong> {hitPoints}</p>}
        {speed && <p><strong>Rychlost:</strong> {speed}</p>}
      </div>

      <Separator className="my-2 bg-red-800" />

      <div className="grid grid-cols-6 gap-2 text-center text-sm">
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">SÍL</div>
          <div>{str}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">OBR</div>
          <div>{dex}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">ODO</div>
          <div>{con}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">INT</div>
          <div>{int}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">MOU</div>
          <div>{wis}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">CHA</div>
          <div>{cha}</div>
        </div>
      </div>

      <Separator className="my-2 bg-red-800" />

      <div className="space-y-1 text-sm">
        {savingThrows && <p><strong>Záchranné hody:</strong> {savingThrows}</p>}
        {skills && <p><strong>Dovednosti:</strong> {skills}</p>}
        {damageVulnerabilities && <p><strong>Zranitelnost:</strong> {damageVulnerabilities}</p>}
        {damageResistances && <p><strong>Odolnost:</strong> {damageResistances}</p>}
        {damageImmunities && <p><strong>Imunita vůči zranění:</strong> {damageImmunities}</p>}
        {conditionImmunities && <p><strong>Imunita vůči stavům:</strong> {conditionImmunities}</p>}
        {senses && <p><strong>Smysly:</strong> {senses}</p>}
        {languages && <p><strong>Jazyky:</strong> {languages}</p>}
        {challenge && <p><strong>Nebezpečnost:</strong> {challenge}</p>}
      </div>
    </div>
  );
}
