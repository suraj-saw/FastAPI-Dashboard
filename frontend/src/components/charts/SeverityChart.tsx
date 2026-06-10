import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { SeverityCount } from "../../types/dashboard";


interface Props {
  data: SeverityCount[];
}


const COLORS = [
  "#2C6EF2",
  "#E85D4A",
  "#F5A623",
  "#27AE60",
  "#7C3AED",
];


const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const { name, value } = payload[0];

  return (
    <div className="rounded-lg border border-[#E4E8F4] bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[#6B7299]">
        {name}
      </p>

      <p className="font-bold text-[#1A1D2E]">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
};


export function SeverityChart({ data }: Props) {

  const total = data.reduce(
    (s, d) => s + d.count,
    0
  );


  return (

    <div className="flex flex-col h-full">


      {/* keep fixed height */}
      <div style={{ width: "100%", height: 200 }}>


        <ResponsiveContainer
          width="100%"
          height="100%"
        >


          <PieChart>


            <Pie

              data={data}

              dataKey="count"

              nameKey="severity"


              cx="50%"
              cy="50%"


              innerRadius={55}
              outerRadius={85}

              paddingAngle={3}


              strokeWidth={0}


              /*
                Important:
                Keep animation ON.
                Only reduce duration.
                Recharts default 1500ms feels slow.
              */

              animationDuration={450}

              animationBegin={0}

            >


              {data.map((_, index) => (

                <Cell

                  key={index}

                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }

                />

              ))}


            </Pie>


            <Tooltip
              content={<CustomTooltip />}
            />


          </PieChart>


        </ResponsiveContainer>


      </div>



      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">


        {data.map((item, index)=>{


          const pct =
            total > 0
            ?
            Math.round(
              item.count / total * 100
            )
            :
            0;


          return (

            <div
              key={item.severity}
              className="flex items-center gap-1.5"
            >


              <span

                className="h-2.5 w-2.5 rounded-sm"

                style={{
                  background:
                  COLORS[index % COLORS.length]
                }}

              />


              <span className="text-[11px] font-medium text-[#6B7299]">

                {item.severity}

              </span>


              <span className="text-[11px] font-bold text-[#1A1D2E]">

                {pct}%

              </span>


            </div>

          );

        })}


      </div>


    </div>

  );
}