import { useState, useMemo } from "react";
import type { LivePlayer } from "@lagranja/types";
import {
  calculatePrizePool,
  formatCurrency,
  getPointsForPosition,
} from "@lagranja/core";

// Numero de WhatsApp para backup de resultados (sin el +)
const WHATSAPP_BACKUP_NUMBER = "5491151010968"; // TODO: Configurar numero real

interface ChampionModalProps {
  championName: string;
  players: LivePlayer[];
  totalRebuys: number;
  buyInAmount: number;
  eventId: string | null;
  onConfirm: () => Promise<boolean>;
  onClose: () => void;
}

export function ChampionModal({
  championName,
  players,
  totalRebuys,
  buyInAmount,
  eventId,
  onConfirm,
  onClose,
}: ChampionModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Obtener jugadores ordenados por posicion (forzar campeon en #1 si falta)
  const sortedPlayers = useMemo(() => {
    const withPositions = [...players].filter((p) => p.position !== null);
    withPositions.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const hasChampion = withPositions.some((p) => p.position === 1);
    if (hasChampion) return withPositions;

    const championPlayer = players.find((p) => p.name === championName);
    if (championPlayer) {
      return [{ ...championPlayer, position: 1 }, ...withPositions];
    }

    return withPositions;
  }, [players, championName]);

  // Calcular premios
  const prizeBreakdown = calculatePrizePool(
    players.length,
    totalRebuys,
    buyInAmount,
  );

  // Generar mensaje de WhatsApp con resultados
  const whatsappMessage = useMemo(() => {
    const date = new Date().toLocaleDateString("es-AR");
    const lines = [
      `Resultados La Granja - ${date}`,
      "",
      `Jugadores: ${players.length}`,
      `Recompras: ${totalRebuys}`,
      `Pozo: ${formatCurrency(prizeBreakdown.netPool)}`,
      "",
      "Posiciones:",
    ];

    sortedPlayers.forEach((player) => {
      const pos = player.position ?? 0;
      const rebuyMark = player.hasRebuy ? " (R)" : "";
      lines.push(`#${pos} ${player.name}${rebuyMark}`);
    });

    return lines.join("\n");
  }, [players, totalRebuys, prizeBreakdown.netPool, sortedPlayers]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_BACKUP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onConfirm();
    setIsSaving(false);
    if (success) {
      setSaved(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Stats del torneo */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs">Jugadores</div>
              <div className="text-white font-bold">{players.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs">Recompras</div>
              <div className="text-white font-bold">{totalRebuys}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs">Pozo</div>
              <div className="text-green-400 font-bold">
                {formatCurrency(prizeBreakdown.netPool)}
              </div>
            </div>
          </div>

          {/* Posiciones finales */}
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Posiciones Finales
          </h3>
          <div className="space-y-2 mb-4">
            {sortedPlayers.map((player) => {
              const position = player.position ?? 0;
              const totalPlayers = players.length;
              const prizeInfo = prizeBreakdown.prizes.find(
                (p) => p.position === position,
              );
              const points = getPointsForPosition(position, totalPlayers);
              const isLastPlace = position === totalPlayers;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    position === 1
                      ? "bg-yellow-600/30 border border-yellow-500"
                      : position === 2
                        ? "bg-gray-400/20 border border-gray-400"
                        : isLastPlace
                          ? "bg-red-900/20 border border-red-800"
                          : "bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-sm w-6 ${
                        position <= 3 ? "text-white font-bold" : "text-gray-400"
                      }`}
                    >
                      #{position}
                    </span>
                    <span
                      className={
                        position <= 3
                          ? "text-white font-medium"
                          : "text-gray-300"
                      }
                    >
                      {player.name}
                    </span>
                    {player.hasRebuy && (
                      <span className="text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
                        R
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {points !== 0 && (
                      <span
                        className={`text-sm ${points < 0 ? "text-red-400" : "text-blue-400"}`}
                      >
                        {points > 0 ? "+" : ""}
                        {points} pts
                      </span>
                    )}
                    {prizeInfo && prizeInfo.amount > 0 && (
                      <span className="text-green-400 text-sm font-medium">
                        {formatCurrency(prizeInfo.amount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!eventId && (
            <p className="text-yellow-500 text-sm mb-3 text-center">
              No hay evento asociado. Los resultados no se guardaran.
            </p>
          )}

          {saved ? (
            <div className="text-center">
              <p className="text-green-400 mb-3">Resultados guardados</p>
              <div className="flex gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium text-center"
                >
                  Enviar al Chiqui
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Cerrar
                </button>
                {eventId && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg text-white font-medium"
                  >
                    {isSaving ? "Guardando..." : "Guardar Resultados"}
                  </button>
                )}
              </div>
              {/* Boton de backup WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-[#25D366] hover:bg-[#128C7E] rounded-lg text-white font-medium text-center"
              >
                Enviar al Chiqui
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
